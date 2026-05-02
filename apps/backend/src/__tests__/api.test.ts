import request from 'supertest';
import app from '../index';

describe('Backend API Integration', () => {
  const testToken = 'Bearer valid-token';

  describe('GET /api/health', () => {
    it('should return 200 and status ok (public route)', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /api/dashboard', () => {
    it('should return 200 with dashboard data', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('fsmState');
      expect(res.body).toHaveProperty('riskScore');
      expect(Array.isArray(res.body.actions)).toBe(true);
      expect(Array.isArray(res.body.pollingStations)).toBe(true);
    });
  });

  describe('GET /api/risk', () => {
    it('should return 200 with risk data', async () => {
      const res = await request(app).get('/api/risk');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('level');
      expect(res.body).toHaveProperty('recommendations');
      expect(Array.isArray(res.body.recommendations)).toBe(true);
    });
  });

  describe('GET /api/polling-stations', () => {
    it('should return 200 with polling stations', async () => {
      const res = await request(app).get('/api/polling-stations');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stations');
      expect(Array.isArray(res.body.stations)).toBe(true);
    });
  });

  describe('POST /api/simulate', () => {
    it('should return risk scores for valid scenarios', async () => {
      const res = await request(app)
        .post('/api/simulate')
        .set('Authorization', testToken)
        .send({ scenarios: [{ remainingSteps: 5, daysLeft: 1 }] });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results[0]).toHaveProperty('score');
    });

    it('should return 400 if scenarios field is missing', async () => {
      const res = await request(app).post('/api/simulate').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 if scenarios is not an array', async () => {
      const res = await request(app).post('/api/simulate').send({ scenarios: 'invalid' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/actions/transition', () => {
    it('should return 400 if event is missing in body', async () => {
      const res = await request(app).post('/api/actions/transition').send({});
      expect(res.status).toBe(400);
    });

    it('should return 200 for a valid transition (CHECK_STATUS from START)', async () => {
      const res = await request(app)
        .post('/api/actions/transition')
        .set('Authorization', testToken)
        .send({ event: 'CHECK_STATUS' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for an invalid transition event', async () => {
      const res = await request(app)
        .post('/api/actions/transition')
        .send({ event: 'CAST_VOTE' }); // CAST_VOTE is invalid from START state

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/notifications/deliver', () => {
    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/deliver')
        .send({ body: 'Test notification body', channels: [] });

      expect(res.status).toBe(400);
    });

    it('should return 400 if body is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/deliver')
        .send({ title: 'Test Title', channels: [] });

      expect(res.status).toBe(400);
    });

    it('should return 200 for a valid notification without push channel', async () => {
      const res = await request(app)
        .post('/api/notifications/deliver')
        .send({ title: 'Test Title', body: 'Test body', channels: [] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/webhooks/fsm-transition', () => {
    it('should return 200 and track a valid FSM transition event', async () => {
      const payload = { userId: 'test-user', from: 'START', to: 'NOT_REGISTERED', event: 'CHECK_STATUS' };
      const message = { data: Buffer.from(JSON.stringify(payload)).toString('base64') };

      const res = await request(app)
        .post('/api/webhooks/fsm-transition')
        .send({ message });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 200 and skip tracking when userId is missing', async () => {
      const payload = { from: 'START', to: 'NOT_REGISTERED', event: 'CHECK_STATUS' };
      const message = { data: Buffer.from(JSON.stringify(payload)).toString('base64') };

      const res = await request(app)
        .post('/api/webhooks/fsm-transition')
        .send({ message });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/webhooks/risk-alert', () => {
    it('should return 200 and track a valid risk alert event', async () => {
      const payload = { userId: 'test-user', riskLevel: 'HIGH', score: 75 };
      const message = { data: Buffer.from(JSON.stringify(payload)).toString('base64') };

      const res = await request(app)
        .post('/api/webhooks/risk-alert')
        .send({ message });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 200 and skip tracking when userId is missing', async () => {
      const payload = { riskLevel: 'HIGH', score: 75 };
      const message = { data: Buffer.from(JSON.stringify(payload)).toString('base64') };

      const res = await request(app)
        .post('/api/webhooks/risk-alert')
        .send({ message });

      expect(res.status).toBe(200);
    });
  });
});
