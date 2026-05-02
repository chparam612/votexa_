import request from 'supertest';
import app from '../../index';
import admin from 'firebase-admin';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user', email: 'test@example.com' }),
  }),
  firestore: () => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ state: 'START' }) }),
    set: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(true),
  }),
}));

describe('Transition Controller API', () => {
  const mockToken = 'Bearer valid-token';

  it('should process a valid transition (START -> CHECK_STATUS)', async () => {
    const response = await request(app)
      .post('/api/actions/transition')
      .set('Authorization', mockToken)
      .send({ event: 'CHECK_STATUS' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.to).toBe('NOT_REGISTERED');
  });

  it('should reject an invalid transition (START -> CAST_VOTE)', async () => {
    const response = await request(app)
      .post('/api/actions/transition')
      .set('Authorization', mockToken)
      .send({ event: 'CAST_VOTE' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/Invalid transition/);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/actions/transition')
      .send({ event: 'CHECK_STATUS' });

    expect(response.status).toBe(401);
  });
});
