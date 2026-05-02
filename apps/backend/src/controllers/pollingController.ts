import { Response } from 'express';
import * as admin from 'firebase-admin';
import { PollingOptimizer } from '../../../../apps/frontend/services/optimization/PollingOptimizer';
import { AuthenticatedRequest } from '../types';

export const getPollingStations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const db = admin.firestore();
    const stationsSnapshot = await db.collection('polling_stations').limit(10).get();
    
    const stations = stationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      success: true,
      data: stations,
    });
  } catch (error) {
    const appError = handleControllerError(error);
    logError(error as Error, 'POLLING_CONTROLLER');
    res.status(appError.statusCode).json({
      success: false,
      error: appError.message,
    });
  }
};
