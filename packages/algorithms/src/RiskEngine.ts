export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskInput {
  remainingSteps: number;
  daysLeft: number;
  multiplier?: number;
}

export interface RiskOutput {
  score: number;
  level: RiskLevel;
}

export interface RiskThresholds {
  high: number;
  critical: number;
}

export class RiskEngine {
  public static calculate(input: RiskInput, thresholds: RiskThresholds): RiskOutput {
    if (input.daysLeft <= 0) {
      return { score: 100, level: 'CRITICAL' };
    }
    
    let score = (input.remainingSteps / 5) * (1 / input.daysLeft) * 100;
    if (input.multiplier) {
      score *= input.multiplier;
    }
    
    score = Math.min(Math.max(score, 0), 100);

    let level: RiskLevel = 'LOW';
    if (score >= thresholds.critical) {
      level = 'CRITICAL';
    } else if (score >= thresholds.high) {
      level = 'HIGH';
    } else if (score >= thresholds.high / 2) {
      level = 'MEDIUM';
    }

    return { score: Math.round(score), level };
  }

  public static batchCalculate(inputs: RiskInput[], thresholds: RiskThresholds): RiskOutput[] {
    return inputs.map(input => this.calculate(input, thresholds));
  }

  public static simulate(scenarios: RiskInput[], thresholds: RiskThresholds): RiskOutput[] {
    return this.batchCalculate(scenarios, thresholds);
  }
}
