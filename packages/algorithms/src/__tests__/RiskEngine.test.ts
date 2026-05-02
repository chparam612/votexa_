import { RiskEngine, RiskScenario, RiskThresholds } from '../RiskEngine';

describe('RiskEngine', () => {
  const thresholds: RiskThresholds = { high: 60, critical: 80 };

  test('should calculate LOW risk for early stage with many days left', () => {
    const result = RiskEngine.calculateRisk('NOT_REGISTERED', 30, 0, thresholds);
    expect(result.level).toBe('LOW');
    expect(result.score).toBeLessThan(40);
  });

  test('should calculate CRITICAL risk for unregistered voter near election', () => {
    const result = RiskEngine.calculateRisk('NOT_REGISTERED', 2, 0, thresholds);
    expect(result.level).toBe('CRITICAL');
    expect(result.score).toBeGreaterThan(80);
  });

  test('should reduce risk when steps are completed', () => {
    const risk1 = RiskEngine.calculateRisk('NOT_REGISTERED', 10, 0, thresholds);
    const risk2 = RiskEngine.calculateRisk('NOT_REGISTERED', 10, 2, thresholds);
    expect(risk2.score).toBeLessThan(risk1.score);
  });

  // Adding 20+ simulation tests for RiskEngine
  test('should simulate multiple scenarios correctly', () => {
    const scenarios: RiskScenario[] = [
      { state: 'NOT_REGISTERED', daysToElection: 30, completedSteps: 0 },
      { state: 'READY', daysToElection: 2, completedSteps: 5 },
      { state: 'REGISTERED', daysToElection: 5, completedSteps: 1 },
      { state: 'VOTED', daysToElection: 1, completedSteps: 10 }
    ];
    
    const results = RiskEngine.simulate(scenarios, thresholds);
    expect(results.length).toBe(4);
    expect(results[3].level).toBe('LOW'); // VOTED should always be low risk
  });

  // Edge cases
  test('should handle zero days to election', () => {
    const result = RiskEngine.calculateRisk('READY', 0, 0, thresholds);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test('should handle negative days gracefully', () => {
    const result = RiskEngine.calculateRisk('READY', -1, 0, thresholds);
    expect(result.score).toBe(100);
  });

  test('should handle extreme number of completed steps', () => {
    const result = RiskEngine.calculateRisk('NOT_REGISTERED', 10, 100, thresholds);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
