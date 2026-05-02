# Votexa Deployment Guide

## Architecture Overview
Votexa is a monorepo consisting of a React Native (Expo) frontend and an Express.js backend deployed on Google Cloud Run. It utilizes Firestore for data storage, Redis for caching/rate-limiting, and Vertex AI for intelligent recommendations.

## Prerequisites
- Node.js 18+
- Expo CLI
- Google Cloud SDK (gcloud)
- Firebase Project

## Backend Deployment (Cloud Run)

### 1. Build and Containerize
```bash
cd apps/backend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/votexa-backend .
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy votexa-backend \
  --image gcr.io/[PROJECT_ID]/votexa-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT=[PROJECT_ID]"
```

## Frontend Deployment (Expo)

### 1. Configure Environment
Create `apps/frontend/.env` with your backend URL:
```
EXPO_PUBLIC_BACKEND_URL=https://votexa-backend-[HASH].a.run.app
```

### 2. Build APK/AAB
```bash
cd apps/frontend
eas build --platform android
```

## Database Setup (Firestore)
Ensure Firestore is in Native mode and the appropriate indexes are created for polling station location queries.

## Security Considerations
- Ensure `PUBSUB_VERIFICATION_TOKEN` is set for webhook security.
- Set `ALLOWED_ORIGINS` to your production frontend domain.
- Rotate Firebase service account keys regularly.
