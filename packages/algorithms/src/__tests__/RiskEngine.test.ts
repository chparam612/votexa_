import { RiskEngine, RiskInput, RiskThresholds } from '../RiskEngine';

describe('RiskEngine', () => {
  const thresholds: RiskThresholds = { high: 70, critical: 90 };

  it('should return 100 score and CRITICAL level if daysLeft <= 0', () => {
    const input: RiskInput = { remainingSteps: 5, daysLeft: 0 };
    const result = RiskEngine.calculate(input, thresholds);
    expect(result.score).toBe(100);
    expect(result.level).toBe('CRITICAL');
  });

  it('should calculate LOW risk for early scenarios', () => {
    const input: RiskInput = { remainingSteps: 1, daysLeft: 30 };
    const result = RiskEngine.calculate(input, thresholds);
    expect(result.level).toBe('LOW');
    expect(result.score).toBeLessThan(10);
  });

  it('should calculate HIGH risk for tight scenarios', () => {
    const input: RiskInput = { remainingSteps: 4, daysLeft: 1 };
    // Score = (4/5) * (1/1) * 100 = 80
    const result = RiskEngine.calculate(input, thresholds);
    expect(result.score).toBe(80);
    expect(result.level).toBe('HIGH');
  });

  it('should apply multiplier correctly', () => {
    const input: RiskInput = { remainingSteps: 2, daysLeft: 5, multiplier: 2 };
    // Base Score = (2/5) * (1/5) * 100 = 0.4 * 0.2 * 100 = 8
    // With Multiplier = 16
    const result = RiskEngine.calculate(input, thresholds);
    expect(result.score).toBe(16);
  });

  it('should cap score at 100', () => {
    const input: RiskInput = { remainingSteps: 50, daysLeft: 1 };
    const result = RiskEngine.calculate(input, thresholds);
    expect(result.score).toBe(100);
  });
});
