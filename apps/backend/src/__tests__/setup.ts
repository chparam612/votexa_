// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  const mockNotificationsCollection = {
    add: jest.fn(() => Promise.resolve({ id: 'notification-id' })),
  };

  const mockDoc = {
    get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ voterState: 'START' }) })),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    collection: jest.fn(() => mockNotificationsCollection),
  };

  const mockCollection = {
    doc: jest.fn(() => mockDoc),
    where: jest.fn(() => ({ get: jest.fn(() => Promise.resolve({ docs: [] })) })),
  };

  const mockFirestore = {
    collection: jest.fn(() => mockCollection),
    runTransaction: jest.fn((cb) =>
      cb({
        get: jest.fn(() =>
          Promise.resolve({
            exists: true,
            data: () => ({ voterState: 'START', completedSteps: [] }),
          }),
        ),
        update: jest.fn(),
        set: jest.fn(),
      }),
    ),
    FieldValue: {
      arrayUnion: jest.fn(),
    },
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    firestore: Object.assign(
      jest.fn(() => mockFirestore),
      { FieldValue: mockFirestore.FieldValue },
    ),
    credential: {
      cert: jest.fn(),
    },
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'test-user' })),
    })),
  };
});

// Mock Google Cloud Logging
jest.mock('@google-cloud/logging', () => ({
  Logging: jest.fn(() => ({
    log: jest.fn(() => ({
      write: jest.fn(),
      entry: jest.fn(),
    })),
  })),
}));

// Mock Observability Middleware only
jest.mock('../middleware/observability', () => {
  const original = jest.requireActual('../middleware/observability');
  return {
    ...original,
    observabilityMiddleware: (req: any, res: any, next: any) => next(),
  };
});

// Mock Frontend Lib (cross-app import)
jest.mock('@votexa/utils', () => ({
  invalidateUserCache: jest.fn(() => Promise.resolve()),
  publishEvent: jest.fn(() => Promise.resolve()),
  trackEvent: jest.fn(),
  getFlags: jest.fn(() => Promise.resolve({ use_ml_recommendations: false })),
  getCached: jest.fn((key, ttl, fn) => fn()),
}));

// Mock HybridRecommendationEngine
jest.mock('../../../../apps/frontend/services/intelligence/HybridRecommendationEngine', () => ({
  HybridRecommendationEngine: {
    getRecommendations: jest.fn(() =>
      Promise.resolve([
        {
          id: 'check_status',
          title: 'Check Registration Status',
          description: 'Verify your current voter status',
          priority: 'HIGH',
          event: 'CHECK_STATUS',
        },
      ]),
    ),
  },
}));

// Mock PollingOptimizer
jest.mock('../../../../apps/frontend/services/optimization/PollingOptimizer', () => ({
  PollingOptimizer: {
    getTopStations: jest.fn(() => Promise.resolve([])),
  },
}));

// Mock PushService
jest.mock('../../../../apps/frontend/services/intelligence/PushService', () => ({
  PushService: {
    send: jest.fn(() => Promise.resolve(true)),
  },
}));
