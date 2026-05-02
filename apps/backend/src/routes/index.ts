import { Router } from 'express';
import crypto from 'crypto';
import { getDashboard } from '../controllers/dashboardController';
import { transitionController, getStatusController } from '../controllers/transitionController';
import { getRisk, simulateRisk } from '../controllers/riskController';
import { getPollingStations } from '../controllers/pollingController';
import {
  deliverNotification,
  registerToken,
  fsmWebhook,
  riskAlertWebhook,
} from '../controllers/notificationController';
import { 
  validateTransitionRequest, 
  validatePollingRequest, 
  handleValidationErrors 
} from '../middleware/validation';
import { transitionLimiter, pollingSearchLimiter } from '../middleware/rateLimit';
import { authorizeUserOwnership } from '../middleware/auth';

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

// Dashboard
router.get('/dashboard', getDashboard);

// FSM Transition
router.post(
  '/actions/transition', 
  transitionLimiter, 
  validateTransitionRequest, 
  handleValidationErrors, 
  authorizeUserOwnership,
  transitionController
);

router.get('/actions/status', getStatusController);

// Risk
router.get('/risk', getRisk);
router.post('/simulate', simulateRisk);

// Polling
router.get(
  '/polling-stations', 
  pollingSearchLimiter, 
  validatePollingRequest, 
  handleValidationErrors, 
  getPollingStations
);

// Notifications & Webhooks
router.post('/notifications/deliver', deliverNotification); 
router.post('/notifications/register-token', registerToken);
router.post('/webhooks/fsm-transition', verifyPubSubSignature, fsmWebhook); // PubSub webhook
router.post('/webhooks/risk-alert', verifyPubSubSignature, riskAlertWebhook); // PubSub webhook

export default router;
