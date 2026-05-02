import { z } from 'zod';

export const transitionSchema = z.object({
  body: z.object({
    userId: z.string().optional(), // Can be taken from req.user.uid
    event: z.string(),
  }),
});

export const simulateSchema = z.object({
  body: z.object({
    scenarios: z.array(z.object({
      remainingSteps: z.number(),
      daysLeft: z.number(),
    })).optional(),
    scenario: z.string().optional(),
    district: z.string().optional(),
  }),
});

export const registerTokenSchema = z.object({
  body: z.object({
    token: z.string(),
    platform: z.enum(['ios', 'android', 'web']).optional(),
  }),
});

export const pollingStationsSchema = z.object({
  query: z.object({
    district: z.string().optional(),
    state: z.string().optional(),
  }),
});

export const dashboardSchema = z.object({
  query: z.object({
    userId: z.string().optional(),
  }),
});
