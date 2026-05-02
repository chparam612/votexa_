import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { invalidateUserCache, publishEvent } from '../../../../apps/frontend/lib';
import { StateMachine, VoterEvent, VoterState } from '../../../../packages/algorithms/src/StateMachine';
import { AuthenticatedRequest } from '../types';

export const transitionState = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { event } = req.body;
    const userId = (req as any).user?.uid;

    if (!userId) {
      throw new AppError(401, 'Unauthorized: User not found in request');
    }

    if (!validateTransitionEvent(event)) {
      throw new AppError(400, `Invalid transition event: ${event}`);
    }

    const db = admin.firestore();
    const userRef = db.collection('voters').doc(userId);
    const userDoc = await userRef.get();

    let currentState = 'START';
    if (userDoc.exists) {
      currentState = userDoc.data()?.state || 'START';
    }

    const fsm = StateMachine.fromState(currentState as any);
    const nextState = fsm.transition(event as VoterEvent);

    await userRef.set({
      state: nextState,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    logTransition(userId, currentState, nextState, event);

    res.status(200).json({
      success: true,
      data: {
        from: currentState,
        to: nextState,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const appError = handleControllerError(error);
    logError(error as Error, 'TRANSITION_CONTROLLER');
    res.status(appError.statusCode).json({
      success: false,
      error: appError.message,
    });
  }
};

export const getStatusController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const db = admin.firestore();
    const userDoc = await db.collection('voters').doc(userId).get();

    const state = userDoc.exists ? userDoc.data()?.state || 'START' : 'START';
    const fsm = StateMachine.fromState(state);

    res.status(200).json({
      success: true,
      data: {
        state,
        progress: fsm.getProgress(),
        meta: fsm.getMeta(),
      },
    });
  } catch (error) {
    const appError = handleControllerError(error);
    res.status(appError.statusCode).json({
      success: false,
      error: appError.message,
    });
  }
};
