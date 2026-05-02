import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes';
import { observabilityMiddleware } from './middleware/observability';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

// Firebase Admin initialization
// - Cloud Run: Uses Application Default Credentials (ADC) automatically
// - Local Dev: Uses service-account.json file
if (admin.apps.length === 0) {
  try {
    const isCloudRun = !!process.env.K_SERVICE; // Cloud Run sets K_SERVICE automatically
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c';

    if (isCloudRun) {
      // On Cloud Run, use ADC - no service account file needed
      admin.initializeApp({ projectId });
      console.log('✅ Firebase Admin initialized with ADC (Cloud Run)');
    } else {
      // Local development - use service account file
      const serviceAccountPath =
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        path.resolve(process.cwd(), '../../service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId,
      });
      console.log('✅ Firebase Admin initialized with Service Account (Local)');
    }
  } catch (error) {
    // Non-fatal: log but don't crash the server
    console.error('⚠️ Firebase Admin init warning:', (error as Error).message);
  }
}

const app = express();
const port = process.env.PORT || 8080;

const transitionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'Too many transition requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const notificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: 'Too many notification requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(observabilityMiddleware);

app.use('/api/actions/transition', transitionLimiter);
app.use('/api/notifications/deliver', notificationLimiter);
app.use('/api', router);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Always start the server regardless of Firebase init status
// Skip in test environment to avoid open handles
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    console.log(`🚀 Votexa Backend running on port ${port}`);
  });

  // Graceful shutdown for Cloud Run
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
}

export default app;
