import request from 'supertest';
import app from '../index';

// Mocking Firebase Admin to avoid real DB calls during integration tests
jest.mock('firebase-admin', () => ({
  apps: [{ name: 'mock' }],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-123', email: 'test@example.com' }),
  }),
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ state: 'READY', district: 'Downtown' }),
        }),
        set: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      }),
      where: () => ({
        get: jest.fn().mockResolvedValue({
          docs: [{ id: 'station1', data: () => ({ name: 'Central Polling', location: { lat: 1, lng: 1 } }) }],
        }),
      }),
    }),
  }),
}));

describe('Backend Integration Tests', () => {
  const mockToken = 'Bearer mock-token';

  test('GET /api/health should be public', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/dashboard should require auth', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });

  test('GET /api/dashboard should work with token', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', mockToken);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('fsmState');
  });

  test('GET /api/risk should return risk score', async () => {
    const res = await request(app)
      .get('/api/risk')
      .set('Authorization', mockToken);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('score');
  });

  test('POST /api/actions/transition should handle valid transitions', async () => {
    const res = await request(app)
      .post('/api/actions/transition')
      .set('Authorization', mockToken)
      .send({ 
        userId: 'test-user-123',
        event: 'REGISTER_SUCCESS',
        payload: {} 
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/actions/transition should block unauthorized ownership', async () => {
    const res = await request(app)
      .post('/api/actions/transition')
      .set('Authorization', mockToken)
      .send({ 
        userId: 'wrong-user',
        event: 'REGISTER_SUCCESS'
      });
    
    expect(res.status).toBe(403);
  });

  test('GET /api/polling-stations should return stations for district', async () => {
    const res = await request(app)
      .get('/api/polling-stations')
      .set('Authorization', mockToken)
      .query({ district: 'Downtown' });
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
