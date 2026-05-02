import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { invalidateUserCache, publishEvent } from '../../../../apps/frontend/lib';
import { StateMachine, VoterEvent, VoterState } from '../../../../packages/algorithms/src/StateMachine';
import { AuthenticatedRequest } from '../types';

export const transitionState = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { event } = req.body;
    
    if (!userId || !event) return res.status(400).json({ error: 'Missing userId or event' });

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      if (!doc.exists) throw new Error('User not found');
      
      const currentState = doc.data()?.voterState || 'NOT_REGISTERED';
      const fsm = StateMachine.fromState(currentState as VoterState);
      const nextState = fsm.transition(event as VoterEvent);
      
      const historyEntry = {
        from: currentState,
        to: nextState,
        event,
        timestamp: new Date().toISOString()
      };
      
      const completedSteps = doc.data()?.completedSteps || [];
      if (!completedSteps.includes(event)) {
        completedSteps.push(event);
      }

      t.update(userRef, {
        voterState: nextState,
        stateHistory: admin.firestore.FieldValue.arrayUnion(historyEntry),
        completedSteps,
        lastActive: new Date().toISOString()
      });
      
      // Publish event
      await publishEvent('votexa-fsm-transitions', { userId, from: currentState, to: nextState, event });
    });

    await invalidateUserCache(userId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Transition error:', error);
    res.status(400).json({ error: error.message });
  }
};
