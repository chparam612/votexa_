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
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData) throw new Error('User not found');

      const fsmState = userData.voterState || 'NOT_REGISTERED';
      const fsm = StateMachine.fromState(fsmState);
      const experienceLevel = userData.experienceLevel || 'beginner';
      const district = userData.location?.district || 'Unknown';
      
      const riskInput = {
        remainingSteps: 5 - (fsm.getProgress() / 20),
        daysLeft: Math.max(1, Math.floor((new Date(userData.deadlines?.ELECTION_DAY || Date.now() + 864000000).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      };
      
      const risk = RiskEngine.calculate(riskInput, { high: 60, critical: 80 });

      const features = {
        voterState: fsmState,
        riskScore: risk.score,
        daysToElection: riskInput.daysLeft,
        experienceLevel,
        completedSteps: userData.completedSteps || [],
        district
      };

      const actions = await HybridRecommendationEngine.getRecommendations(features);
      const pollingStations = await PollingOptimizer.getTopStations(userId, district);

      return {
        fsmState,
        progress: fsm.getProgress(),
        riskScore: risk.score,
        actions,
        pollingStations
      };
    });

    res.json(dashboardData);
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};
