import request from 'supertest';
import app from '../index';

describe('Backend API Integration', () => {
  describe('GET /api/health', () => {
    it('should return 200 and status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/simulate', () => {
    it('should return risk scores for valid scenarios', async () => {
      const res = await request(app)
        .post('/api/simulate')
        .send({ scenarios: [{ remainingSteps: 5, daysLeft: 1 }] });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results[0]).toHaveProperty('score');
    });
  });

  describe('POST /api/actions/transition', () => {
    it('should return 400 if event is missing in body', async () => {
      const res = await request(app).post('/api/actions/transition').send({});

      expect(res.status).toBe(400);
    });

    it('should return 200 for a valid transition', async () => {
      const res = await request(app)
        .post('/api/actions/transition')
        .send({ event: 'CHECK_STATUS' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
