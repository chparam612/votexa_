import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { transitionState } from '../controllers/transitionController';
import { getRisk, simulateRisk } from '../controllers/riskController';
import { getPollingStations } from '../controllers/pollingController';
import { deliverNotification, registerToken, fsmWebhook, riskAlertWebhook } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/observability';

const router = Router();

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
router.post('/notifications/deliver', deliverNotification); // Usually authenticated via Cloud Tasks OIDC
router.post('/notifications/register-token', authMiddleware, registerToken);
router.post('/webhooks/fsm-transition', fsmWebhook); // PubSub webhook
router.post('/webhooks/risk-alert', riskAlertWebhook); // PubSub webhook

export default router;
