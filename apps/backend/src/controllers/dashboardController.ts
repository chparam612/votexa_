import { Response } from 'express';
import * as admin from 'firebase-admin';
import { getCached } from '../../../../apps/frontend/lib';
import { StateMachine } from '../../../../packages/algorithms/src/StateMachine';
import { RiskEngine } from '../../../../packages/algorithms/src/RiskEngine';
import { HybridRecommendationEngine } from '../../../../apps/frontend/services/intelligence/HybridRecommendationEngine';
import { PollingOptimizer } from '../../../../apps/frontend/services/optimization/PollingOptimizer';
import { AuthenticatedRequest } from '../types';

export const getDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const dashboardData = await getCached(`dashboard:${userId}`, 60, async () => {
      const db = admin.firestore();
      // Standardized to 'voters' collection
      const userDoc = await db.collection('voters').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData) {
        // Return default dashboard for new users
        return {
          fsmState: 'START',
          progress: 0,
          riskScore: 0,
          actions: [
            {
              id: 'start_reg',
              title: 'Start Registration',
              description: 'Click here to begin your voter journey.',
              priority: 'HIGH',
              event: 'CHECK_STATUS'
            }
          ],
          pollingStations: []
        };
      }

      const fsmState = userData.state || 'START';
      const fsm = StateMachine.fromState(fsmState as any);
      
      const riskInput = {
        remainingSteps: 6 - fsm.getHistory().length,
        daysLeft: Math.max(
          1, 
          Math.floor(((userData.deadlines?.ELECTION_DAY || Date.now() + 864000000) - Date.now()) / (1000 * 60 * 60 * 24))
        )
      };
      
      const risk = RiskEngine.calculate(riskInput, { high: 60, critical: 80 });

      // Note: In a real monorepo, HybridRecommendationEngine should be in a shared package if backend needs it.
      // For now, I'll return mock/calculated data to ensure connectivity works.
      const actions = [
        {
          id: 'action_1',
          title: fsm.getMeta().label,
          description: `Complete your ${fsmState} step to progress.`,
          priority: risk.level,
          event: 'NEXT_STEP'
        }
      ];

      return {
        fsmState,
        progress: fsm.getProgress(),
        riskScore: risk.score,
        actions,
        pollingStations: userData.pollingStations || []
      };
    });

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    const appError = handleControllerError(error);
    logError(error as Error, 'DASHBOARD_CONTROLLER');
    res.status(appError.statusCode).json({
      success: false,
      error: appError.message,
    });
  }
};
