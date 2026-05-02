import request from 'supertest';
import express from 'express';
import { authMiddleware } from '../middleware/observability';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => ({
  auth: jest.fn(),
}));

const app = express();
app.use(express.json());
app.get('/test-auth', authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

describe('authMiddleware', () => {
  const mockVerifyIdToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (admin.auth as any).mockReturnValue({
      verifyIdToken: mockVerifyIdToken,
    });
  });

  it('should return 401 if no authorization header is provided', async () => {
    const response = await request(app).get('/test-auth');
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Missing or invalid token');
  });

  it('should return 401 if invalid token is provided', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
    const response = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Token verification failed');
  });

  it('should pass and set req.user if valid token is provided', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' };
    mockVerifyIdToken.mockResolvedValue(mockUser);
    
    const response = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(mockUser);
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
  });
});
