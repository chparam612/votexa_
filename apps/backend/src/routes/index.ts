import { Router } from 'express';
import crypto from 'crypto';
import { getDashboard } from '../controllers/dashboardController';
import { transitionState } from '../controllers/transitionController';
import { getRisk, simulateRisk } from '../controllers/riskController';
import { getPollingStations } from '../controllers/pollingController';
import {
  deliverNotification,
  registerToken,
  fsmWebhook,
  riskAlertWebhook,
} from '../controllers/notificationController';
import { authMiddleware } from '../middleware/observability';

const router = Router();

const verifyPubSubSignature = (req: any, res: any, next: any) => {
  const signature = req.headers['x-goog-signature'];
  const secret = process.env.PUBSUB_VERIFICATION_TOKEN;

  if (!secret) {
    console.warn('⚠️ PUBSUB_VERIFICATION_TOKEN not set, skipping verification in development');
    return next();
  }

  if (!signature) {
    return res.status(401).json({ error: 'Missing x-goog-signature header' });
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(req.body)).digest('base64');

  if (signature !== digest) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  next();
};

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok', services: 15 }));

// Dashboard
router.get('/dashboard', authMiddleware, getDashboard);

// FSM Transition
router.post('/actions/transition', authMiddleware, transitionState);

// Risk
router.get('/risk', authMiddleware, getRisk);
router.post('/simulate', simulateRisk); // auth optional or admin for simulation

// Polling
router.get('/polling-stations', authMiddleware, getPollingStations);

// Notifications & Webhooks
router.post('/notifications/deliver', authMiddleware, deliverNotification); // Authenticated via Firebase auth token
router.post('/notifications/register-token', authMiddleware, registerToken);
router.post('/webhooks/fsm-transition', verifyPubSubSignature, fsmWebhook); // PubSub webhook
router.post('/webhooks/risk-alert', verifyPubSubSignature, riskAlertWebhook); // PubSub webhook

export default router;
