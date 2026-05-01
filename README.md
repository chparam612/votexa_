# Votexa: Smart Election Assistant

Production-grade Smart Election Assistant mobile application. Built with React Native, Expo Router, NativeWind, and an Express monorepo backed by 15 Google Cloud & Firebase services.

## Architecture Diagram

```ascii
                          +-------------------------+
                          |   React Native (Expo)   |
                          |   (apps/frontend)       |
                          +------------+------------+
                                       |
                               (HTTPS / REST API)
                                       |
  +------------------------------------v------------------------------------+
  |                           Cloud Run (apps/backend)                      |
  |  +----------------+  +-------------------+  +------------------------+  |
  |  | Dashboard Ctrl |  | Transition Ctrl   |  | Polling/Risk/Notification |  |
  |  +-------+--------+  +---------+---------+  +------------+-----------+  |
  +----------|---------------------|-------------------------|--------------+
             |                     |                         |
             |             (Pub/Sub Events)                  |
             v                     v                         v
+------------------------+ +---------------------+ +--------------------------+
| Firestore & Auth       | | Event Bus           | | Intelligence Services    |
| (Database & Identity)  | | (Google Pub/Sub)    | | (packages/algorithms)    |
+------------------------+ +---------------------+ +--------------------------+
             |                     |                         |
             v                     v                         v
+------------------------+ +---------------------+ +--------------------------+
| Cloud Memorystore      | | BigQuery            | | Vertex AI / Maps / Tasks |
| (Redis Caching)        | | (Analytics)         | | (ML & Scheduling)        |
+------------------------+ +---------------------+ +--------------------------+
```

## Security & Reliability

- **Security Headers**: Powered by `helmet` for protection against common web vulnerabilities.
- **Rate Limiting**: Critical endpoints like state transitions are protected via `express-rate-limit`.
- **HMAC Verification**: All Pub/Sub webhooks require valid `x-goog-signature` headers verified against a shared secret.
- **Testing**:
  - **Algorithms**: 100% test coverage for state machine and risk engines using Jest.
  - **API**: Integration tests for all backend routes using Supertest.
- **CI/CD**: Automated testing pipeline via GitHub Actions on every push to `main`.

## Accessibility (WCAG 2.1)

- Full Screen Reader support with semantic `accessibilityLabels` and `accessibilityRoles`.
- AA-compliant color contrast (4.5:1+) across all primary UI paths.
- Accessible progress tracking for voters through screen-reader-optimized stepper components.

## Development Workflow

- **Linting**: Standardized code quality using ESLint and Prettier across the entire monorepo.
- **Pre-commit Hooks**: Enforced via `husky` and `lint-staged`. Code must pass linting before it can be committed.

## Step-by-Step FSM Transition Data Flow

1. **User Action**: Voter taps "Verify Identity" on `actions.tsx`.
2. **API Request**: Frontend POSTs to `/api/actions/transition` with `event='VERIFY'`.
3. **Database Tx**: Backend fetches user from Firestore, runs pure FSM logic (from `packages/algorithms`), and updates user document with new state and history via Firestore transaction.
4. **Cache Invalidated**: Backend calls `invalidateUserCache(userId)` which clears Redis keys.
5. **Event Published**: Backend publishes `votexa-fsm-transitions` event to Pub/Sub.
6. **API Response**: Backend immediately returns 200 OK to the client.
7. **Webhook Triggered**: Pub/Sub pushes event to `/api/webhooks/fsm-transition`.
8. **Analytics Tracked**: Webhook handler records the transition in BigQuery.
9. **Next Actions**: If state warrants, a new notification is queued via Cloud Tasks for future delivery.

## Cost Estimate (at 100K users/month)

| Service | Estimated Usage | Cost / Month (USD) |
|---------|-----------------|--------------------|
| Cloud Run | 5M Requests | ~$2.00 |
| Firestore | 10M Reads, 2M Writes | ~$5.00 |
| Memorystore (Redis) | 1GB instance (Basic) | ~$35.00 |
| Pub/Sub | 500k messages | ~$0.00 (Free Tier) |
| Cloud Tasks | 1M Operations | ~$0.40 |
| Google Maps API | 100K Distance Matrix | ~$500.00 |
| Vertex AI (Gemini) | 50M tokens | ~$50.00 |
| BigQuery | 5GB Storage, 10GB Query | ~$0.00 (Free Tier) |
| Firebase Auth | 100K active users | Free |
| **TOTAL** | | **~$592.40** |

## Setup Instructions

### Step 1 — Prerequisites
- Install [Node.js 20+](https://nodejs.org)
- Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install), then run:
  ```bash
  gcloud auth login
  gcloud auth application-default login
  ```
- Install [Expo Go](https://expo.dev/go) on your Android/iOS phone

### Step 2 — Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `EXPO_PUBLIC_FIREBASE_API_KEY` — Firebase Console → Project Settings → Web App
- `EXPO_PUBLIC_FIREBASE_APP_ID` — same page
- `EXPO_PUBLIC_BACKEND_URL` — set after deploying backend (Step 3)

Place your Firebase service account key at the repo root:
```
service-account.json   ← download from Firebase Console → Project Settings → Service Accounts
```

### Step 3 — Deploy backend to Cloud Run (one-time)
```bash
npm run setup:gcloud
```
This provisions all GCP resources (Redis, Pub/Sub, BigQuery, Cloud Tasks) and deploys the backend.
Copy the printed Cloud Run URL into `.env` as `EXPO_PUBLIC_BACKEND_URL`.

### Step 4 — Verify setup
```bash
npm run verify
```
This checks your `.env`, `service-account.json`, gcloud login, dependencies, and backend health.

### Step 5 — Run locally

**Windows:**
```bat
fix.bat
```

**Mac / Linux:**
```bash
bash fix.sh
```

Both scripts clean caches, install dependencies, start the backend, and launch the Expo Metro server.
Scan the QR code with Expo Go on your phone (phone and PC must be on the same Wi-Fi).

### Step 6 — Build a standalone APK
```bash
npm install -g eas-cli
eas login
npm run build:android -w apps/frontend
```

### Development Commands
- Run tests: `npm test`
- Linting: `npm run lint`
- Format code: `npm run format`

### View Logs & Results
| What | Where |
|------|-------|
| Backend logs (live) | `gcloud beta run services logs tail votexa-backend --region=<YOUR_REGION>` (default: `asia-south1`) |
| Backend logs (Cloud Console) | Cloud Run → votexa-backend → **LOGS** tab |
| Analytics events | BigQuery → `votexa_analytics.events` |
| Custom metrics | Cloud Monitoring → Metrics Explorer → `custom.googleapis.com/votexa/*` |
| Frontend errors | Expo terminal output; shake phone → Dev Menu → Debug |
| Backend health | `GET $EXPO_PUBLIC_BACKEND_URL/api/health` → `{"status":"ok"}` |
