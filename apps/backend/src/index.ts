import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import router from './routes';
import { observabilityMiddleware } from './middleware/observability';
import { generalLimiter, transitionLimiter, notificationLimiter } from './middleware/rateLimit';
import { authenticateUser } from './middleware/auth';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

// Firebase Admin initialization
if (admin.apps.length === 0) {
  try {
    const isCloudRun = !!process.env.K_SERVICE;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c';

    if (isCloudRun) {
      admin.initializeApp({ projectId });
      console.log('✅ Firebase Admin initialized with ADC (Cloud Run)');
    } else {
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
    console.error('⚠️ Firebase Admin init warning:', (error as Error).message);
  }
}

const app = express();
const port = process.env.PORT || 8080;

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);

// Global Rate Limiting
app.use(generalLimiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(observabilityMiddleware);

// Public Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route-specific rate limits
app.use('/api/actions/transition', transitionLimiter);
app.use('/api/notifications', notificationLimiter);

// Authenticated API routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  return authenticateUser(req, res, next);
});

// Main router
app.use('/api', router);

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    console.log(`🚀 Votexa Backend running on port ${port}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
}

export default app;
