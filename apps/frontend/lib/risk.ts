import { recordMetric } from './metrics';

export const calculateRiskScore = (data: any) => {
  // Logic to calculate local risk score before sending to backend
  let score = 0;
  if (data.latency > 500) score += 20;
  if (data.errors > 0) score += 50;
  return Math.min(score, 100);
};

export const reportRisk = async (score: number, context: string) => {
  await recordMetric('voter_risk_score', score, { context });
};
