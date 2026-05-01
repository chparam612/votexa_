// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  const mockDoc = {
    get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ voterState: 'START' }) })),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
  };

  const mockCollection = {
    doc: jest.fn(() => mockDoc),
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

// Mock Middleware
jest.mock('../middleware/observability', () => ({
  observabilityMiddleware: (req: any, res: any, next: any) => next(),
  authMiddleware: (req: any, res: any, next: any) => {
    (req as any).user = { uid: 'test-user' };
    next();
  },
}));

// Mock Frontend Lib (cross-app import)
jest.mock('../../../../apps/frontend/lib', () => ({
  invalidateUserCache: jest.fn(() => Promise.resolve()),
  publishEvent: jest.fn(() => Promise.resolve()),
  trackEvent: jest.fn(),
  getFlags: jest.fn(() => Promise.resolve({ use_ml_recommendations: false })),
  getCached: jest.fn((key, ttl, fn) => fn()),
}));
