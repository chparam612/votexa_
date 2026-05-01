import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import router from './routes';
import { observabilityMiddleware } from './middleware/observability';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(process.cwd(), '../../service-account.json');

if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      projectId: 'votexa-ac15c'
    });
    console.log('✅ Firebase Admin initialized with Service Account');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
  }
}

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(observabilityMiddleware);
app.use('/api', router);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Votexa Backend running on port ${port}`);
});
