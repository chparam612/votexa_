import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccountPath),
    projectId: 'votexa-ac15c'
  });
}

const db = getFirestore();

const seed = async () => {
  console.log('Seeding Firestore...');

  const stations = [
    {
      id: 'station-1',
      name: 'Delhi Public School Booth',
      address: 'Mathura Road, New Delhi',
      location: { lat: 28.5919, lng: 77.2410 },
      district: 'New Delhi',
      crowd_factor: 0.8,
      avg_wait_minutes: 45
    },
    {
      id: 'station-2',
      name: 'Community Center',
      address: 'Lodhi Road, New Delhi',
      location: { lat: 28.5880, lng: 77.2250 },
      district: 'New Delhi',
      crowd_factor: 0.2,
      avg_wait_minutes: 10
    }
  ];

  for (const station of stations) {
    const { id, ...data } = station;
    await db.collection('polling_stations').doc(id).set(data);
    console.log(`- Seeded: ${station.name}`);
  }

  console.log('Seeding complete!');
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
