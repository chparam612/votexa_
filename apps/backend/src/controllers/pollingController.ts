import { Response } from 'express';
import * as admin from 'firebase-admin';
import { PollingOptimizer } from '../../../../apps/frontend/services/optimization/PollingOptimizer';
import { AuthenticatedRequest } from '../types';

export const getPollingStations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const district = userDoc.data()?.location?.district || 'Unknown';

    const stations = await PollingOptimizer.getTopStations(userId, district);
    
    res.json({ stations });
  } catch (error: any) {
    console.error('Polling stations fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};
