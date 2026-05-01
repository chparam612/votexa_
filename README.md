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
1. Copy `.env.example` to `.env` and fill in Firebase/GCP credentials.
2. Install dependencies: `npm install`
3. Run `fix.bat` on Windows to clean install and start.
4. Run tests: `npm test`
5. Linting: `npm run lint`