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

  it('should treat negative daysLeft as 0 and return CRITICAL', () => {
    const input: RiskInput = { remainingSteps: 3, daysLeft: -5 };
    const result = RiskEngine.calculate(input, thresholds);
    expect(result.score).toBe(100);
    expect(result.level).toBe('CRITICAL');
  });

  it('should return MEDIUM risk for mid-range scenarios', () => {
    // Score = (4/5) * (1/2) * 100 = 40 → between high/2 (35) and high (70) → MEDIUM
    const input: RiskInput = { remainingSteps: 4, daysLeft: 2 };
    const result = RiskEngine.calculate(input, thresholds);
    expect(result.level).toBe('MEDIUM');
  });

  describe('batchCalculate', () => {
    it('should calculate risk for multiple inputs', () => {
      const inputs: RiskInput[] = [
        { remainingSteps: 1, daysLeft: 30 },
        { remainingSteps: 4, daysLeft: 1 },
      ];
      const results = RiskEngine.batchCalculate(inputs, thresholds);
      expect(results).toHaveLength(2);
      expect(results[0].level).toBe('LOW');
      expect(results[1].level).toBe('HIGH');
    });

    it('should return an empty array for empty input', () => {
      const results = RiskEngine.batchCalculate([], thresholds);
      expect(results).toEqual([]);
    });
  });

  describe('simulate', () => {
    it('should return results for multiple scenarios', () => {
      const scenarios: RiskInput[] = [
        { remainingSteps: 5, daysLeft: 0 },
        { remainingSteps: 1, daysLeft: 30 },
      ];
      const results = RiskEngine.simulate(scenarios, thresholds);
      expect(results).toHaveLength(2);
      expect(results[0].score).toBe(100);
      expect(results[1].level).toBe('LOW');
    });

    it('should return an empty array for empty scenarios', () => {
      const results = RiskEngine.simulate([], thresholds);
      expect(results).toEqual([]);
    });
  });
});
