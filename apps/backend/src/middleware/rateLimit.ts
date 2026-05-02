import rateLimit from 'express-rate-limit';

// General API limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for state transitions
export const transitionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 transitions per minute
  keyGenerator: (req: any) => req.user?.uid || req.ip || 'unknown',
  message: { error: 'Too many state transitions, please wait before trying again' },
  standardHeaders: true,
  legacyHeaders: false
});

// Polling search limiter
export const pollingSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: { error: 'Too many polling searches, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth limiter - strict
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Notification limiter
export const notificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many notification requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
