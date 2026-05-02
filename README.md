# Votexa: Smart Election Assistant 🗳️

Votexa is a production-ready, high-performance Smart Election Assistant designed to guide voters through every step of the election process with real-time intelligence and security.

## 🚀 Overview

Votexa solves the problem of voter information fragmentation by providing a unified, intelligent platform that offers personalized recommendations based on proximity, accessibility, and real-time polling data.

### Key Features
- **Intelligent Voter Journey**: Managed by a Finite State Machine (FSM) for secure state transitions.
- **Real-time Risk Assessment**: Multi-factor scoring for polling station safety and wait times.
- **Smart Discovery**: Proximity-based polling station finder with accessibility tracking.
- **WCAG 2.1 Compliance**: Fully accessible UI with screen reader support.
- **Secure by Design**: Strict input validation, rate limiting, and PII protection.

## 🏗️ Architecture

```
                                      ┌──────────────┐
                                      │ Vertex AI    │
                                      └──────┬───────┘
                                             │
      ┌────────────┐        ┌────────────────┴────────────────┐        ┌──────────────┐
      │  Android   │        │        Cloud Run Backend        │        │  Firestore   │
      │   (Expo)   │◀──────▶│        (Express + TS)           │◀──────▶│  (Database)  │
      └────────────┘        └────────────────┬────────────────┘        └──────────────┘
                                             │
                                      ┌──────┴───────┐
                                      │ Redis (Cache)│
                                      └──────────────┘
```

## 📚 Documentation

Detailed technical guides are available in the `docs/` directory:

- [API Endpoints](docs/API_ENDPOINTS.md) - Full REST API documentation.
- [FSM Transitions](docs/FSM_TRANSITIONS.md) - State machine logic and diagram.
- [Testing Guide](docs/TESTING.md) - Test structure and coverage thresholds.
- [Deployment Guide](docs/DEPLOYMENT.md) - GCP and Expo deployment steps.
- [Accessibility Compliance](docs/ACCESSIBILITY.md) - Inclusive design standards.

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Expo CLI
- GCP Project with Firebase enabled

### Quick Start
1. Clone the repo.
2. Install dependencies: `npm install`
3. Start backend: `npm run dev:backend`
4. Start frontend: `npm run dev:frontend`

### Running Tests
```bash
npm run test:all        # Run unit, integration, and E2E tests
npm run test:coverage   # Generate coverage report (>80% target)
```

## 🛡️ Security

Votexa implements high-security standards:
- **Helmet.js** for secure HTTP headers.
- **Rate Limiting** on all sensitive endpoints.
- **Zod & Express-Validator** for multi-layered input validation.
- **PII Masking** in all logging and monitoring systems.

---

## 💰 Cost Estimate

| Service | Usage Tier | Monthly Cost |
|---------|------------|--------------|
| Cloud Run | 2 Million Requests | ~$0.00 (Free Tier) |
| Cloud Firestore | 1GB Storage / 50K Ops | ~$0.00 (Free Tier) |
| Vertex AI | 1K Predications | ~$92.40 |
| Google Maps API | 10K Distance Matrix calls | ~$50.00 |
| **TOTAL** | | **~$142.40** |

---

Built for the **Google Cloud Prompt Wars 2026** using Antigravity.

