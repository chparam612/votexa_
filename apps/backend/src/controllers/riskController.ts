import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { getCached } from '../../../../apps/frontend/lib';
import { RiskEngine } from '../../../../packages/algorithms/src/RiskEngine';
import { StateMachine } from '../../../../packages/algorithms/src/StateMachine';
import { AuthenticatedRequest } from '../types';

export const getRisk = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const riskData = await getCached(`risk:${userId}`, 30, async () => {
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData) throw new Error('User not found');

      const fsmState = userData.voterState || 'NOT_REGISTERED';
      const fsm = StateMachine.fromState(fsmState);

      const riskInput = {
        remainingSteps: 5 - fsm.getProgress() / 20,
        daysLeft: Math.max(
          1,
          Math.floor(
            (new Date(userData.deadlines?.ELECTION_DAY || Date.now() + 864000000).getTime() -
              Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        ),
      };

      const risk = RiskEngine.calculate(riskInput, { high: 60, critical: 80 });

      const recommendations = [];
      if (risk.level === 'CRITICAL' || risk.level === 'HIGH') {
        recommendations.push(
          'You are at high risk of missing the election deadline. Complete the next step immediately.',
        );
        if (riskInput.daysLeft < 7) {
          recommendations.push('Less than a week left! Ensure your identity documents are ready.');
        }
      } else {
        recommendations.push('You are on track. Continue with your registration steps.');
      }

      return {
        score: risk.score,
        level: risk.level,
        breakdown: riskInput,
        recommendations,
      };
    });

    res.json(riskData);
  } catch (error: any) {
    console.error('Risk fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const simulateRisk = async (req: Request, res: Response) => {
  try {
    const { scenarios } = req.body;
    if (!scenarios || !Array.isArray(scenarios))
      return res.status(400).json({ error: 'Invalid scenarios array' });

    const results = RiskEngine.simulate(scenarios, { high: 60, critical: 80 });
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
