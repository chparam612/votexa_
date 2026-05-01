import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { log, recordMetric } from '../../../../apps/frontend/lib';

export const observabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log API call
    log('INFO', `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      userId: (req as any).user?.uid || 'anonymous'
    });

    // Record latency metric
    recordMetric('api_latency', duration, {
      method: req.method,
      endpoint: req.route?.path || req.originalUrl
    });
  });

  next();
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};
