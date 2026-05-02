import request from 'supertest';
import app from '../../index';

jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user' }),
  }),
  firestore: () => ({
    collection: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ name: 'Station 1', lat: 10, lng: 20 }) }
      ]
    }),
  }),
}));

describe('Polling Controller API', () => {
  const mockToken = 'Bearer valid-token';

  it('should return nearby polling stations', async () => {
    const response = await request(app)
      .get('/api/polling')
      .query({ lat: 10, lng: 20, radius: 5000 })
      .set('Authorization', mockToken);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('should validate coordinates', async () => {
    const response = await request(app)
      .get('/api/polling')
      .query({ lat: 100, lng: 200 }) // Invalid
      .set('Authorization', mockToken);

    expect(response.status).toBe(400);
  });
});
