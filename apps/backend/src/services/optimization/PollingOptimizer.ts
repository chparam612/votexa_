import { getSecret } from '../secrets';
import { getCached, getFlags } from '@votexa/utils';

const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export interface RawStation {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  crowd_factor: number;
  avg_wait_minutes: number;
}

export interface OptimizedStation extends RawStation {
  distance_km: number;
  score: number;
  maps_url: string;
}

export class PollingOptimizer {
  private static async fetchDistances(origin: {lat: number, lng: number}, destinations: RawStation[]): Promise<number[]> {
    if (!isNode) return destinations.map(() => 0);
    try {
      const apiKey = await getSecret('MAPS_API_KEY');
      const axios = require('axios');
      
      const originsStr = `${origin.lat},${origin.lng}`;
      const destsStr = destinations.map(d => `${d.location.lat},${d.location.lng}`).join('|');
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destsStr}&key=${apiKey}`;
      const response = await axios.get(url);
      
      const elements = response.data.rows[0].elements;
      return elements.map((e: any) => e.status === 'OK' ? e.distance.value / 1000 : 999);
    } catch (error) {
      console.error('Distance Matrix API failed', error);
      return destinations.map(() => 999);
    }
  }

  public static async getTopStations(userId: string, district: string): Promise<OptimizedStation[]> {
    if (!isNode) return [];
    
    // We cache by district to avoid redundant DB reads and Maps API calls
    return getCached(`polling:${district}`, 300, async () => {
      const admin = require('firebase-admin');
      const db = admin.firestore();
      
      // Get user location
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) return [];
      const userLoc = userDoc.data()?.location;
      if (!userLoc || !userLoc.lat || !userLoc.lng) return [];

      // Get all stations in district
      const snapshot = await db.collection('polling_stations').where('district', '==', district).get();
      const rawStations: RawStation[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));

      if (rawStations.length === 0) return [];

      // Fetch actual distances
      const distances = await this.fetchDistances(userLoc, rawStations);
      
      const flags = await getFlags();
      const wDist = flags.polling_optimizer_distance_weight || 0.4;
      const wCrowd = flags.polling_optimizer_crowd_weight || 0.35;
      const wWait = 1.0 - wDist - wCrowd; // roughly 0.25

      const optimized: OptimizedStation[] = rawStations.map((station, i) => {
        const distance_km = distances[i];
        
        // Normalize values for scoring (lower is better for all metrics)
        // distance normalized max 20km
        const normDist = Math.min(distance_km / 20, 1.0); 
        // crowd_factor is already 0-1
        const normCrowd = station.crowd_factor;
        // wait normalized max 60 min
        const normWait = Math.min(station.avg_wait_minutes / 60, 1.0);

        const penalty = (normDist * wDist) + (normCrowd * wCrowd) + (normWait * wWait);
        // Score out of 100, higher is better
        const score = Math.round((1 - penalty) * 100);

        const maps_url = `https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lng}`;

        return {
          ...station,
          distance_km,
          score,
          maps_url
        };
      });

      optimized.sort((a, b) => b.score - a.score);
      return optimized.slice(0, flags.max_polling_stations_shown || 3);
    });
  }
}
