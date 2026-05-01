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

## File Tree
```
votexa/
├── package.json
├── eas.json
├── .env.example
├── fix.bat
├── README.md
├── scripts/
│   ├── seedFirestore.ts
│   ├── setupAlerts.ts
│   └── setupGCloud.sh
├── packages/
│   └── algorithms/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── DecisionEngine.ts
│           ├── PriorityQueue.ts
│           ├── RiskEngine.ts
│           ├── StateMachine.ts
│           └── index.ts
├── apps/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── controllers/
│   │       │   ├── dashboardController.ts
│   │       │   ├── notificationController.ts
│   │       │   ├── pollingController.ts
│   │       │   ├── riskController.ts
│   │       │   └── transitionController.ts
│   │       ├── middleware/
│   │       │   └── observability.ts
│   │       └── routes/
│   │           └── index.ts
│   └── frontend/
│       ├── app.json
│       ├── babel.config.js
│       ├── global.css
│       ├── metro.config.js
│       ├── package.json
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── app/
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── (auth)/
│       │   │   └── login.tsx
│       │   └── (app)/
│       │       ├── actions.tsx
│       │       ├── dashboard.tsx
│       │       ├── notifications.tsx
│       │       ├── polling.tsx
│       │       └── risk.tsx
│       ├── components/
│       │   ├── ActionCard.tsx
│       │   ├── FSMStepper.tsx
│       │   ├── NotificationBell.tsx
│       │   ├── PollingStationCard.tsx
│       │   └── RiskGauge.tsx
│       ├── config/
│       │   └── firebase.ts
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useDashboard.ts
│       │   ├── usePolling.ts
│       │   └── useRisk.ts
│       ├── lib/
│       │   ├── analytics.ts
│       │   ├── cache.ts
│       │   ├── eventBus.ts
│       │   ├── featureFlags.ts
│       │   ├── index.ts
│       │   ├── logger.ts
│       │   ├── metrics.ts
│       │   └── secrets.ts
│       └── services/
│           ├── intelligence/
│           │   ├── HybridRecommendationEngine.ts
│           │   ├── MLRecommendationEngine.ts
│           │   ├── NotificationScheduler.ts
│           │   ├── PushService.ts
│           │   └── TaskQueueService.ts
│           └── optimization/
│               └── PollingOptimizer.ts
```

## Setup Instructions
1. Copy `.env.example` to `.env` and fill in Firebase/GCP credentials.
2. Run `fix.bat` on Windows to clean install dependencies and start the app.
3. Use `scripts/setupGCloud.sh` to provision GCP resources.