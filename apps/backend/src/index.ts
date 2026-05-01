import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes';
import { observabilityMiddleware } from './middleware/observability';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.resolve(process.cwd(), '../../service-account.json');

if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      projectId: 'votexa-ac15c',
    });
    console.log('✅ Firebase Admin initialized with Service Account');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
  }
}

const app = express();
const port = process.env.PORT || 8080;

const transitionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many transition requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(observabilityMiddleware);

app.use('/api/actions/transition', transitionLimiter);
app.use('/api', router);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Votexa Backend running on port ${port}`);
  });
}

export default app;
