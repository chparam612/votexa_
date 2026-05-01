import { DecisionEngine } from '../DecisionEngine';

describe('DecisionEngine', () => {
  it('should return correct rule-based actions for START state', () => {
    const actions = DecisionEngine.getRuleBasedActions('START', 'beginner');
    expect(actions).toHaveLength(1);
    expect(actions[0].id).toBe('check_status');
    expect(actions[0].priority).toBe('HIGH');
  });

  it('should provide personalized descriptions based on experience', () => {
    const beginnerActions = DecisionEngine.getRuleBasedActions('NOT_REGISTERED', 'beginner');
    const experiencedActions = DecisionEngine.getRuleBasedActions('NOT_REGISTERED', 'experienced');

    expect(beginnerActions[0].description).toContain('Complete Form 6');
    expect(experiencedActions[0].description).toContain('Submit Form 6 online');
  });

  it('should return CRITICAL priority for CAST_VOTE action in READY state', () => {
    const actions = DecisionEngine.getRuleBasedActions('READY', 'experienced');
    expect(actions[0].event).toBe('CAST_VOTE');
    expect(actions[0].priority).toBe('CRITICAL');
  });

  it('should allow ML recommendations to take precedence', () => {
    const mlActions = [
      {
        id: 'ml_1',
        title: 'ML Hint',
        description: 'desc',
        priority: 'HIGH' as const,
        event: 'ML_EVENT',
      },
    ];
    const actions = DecisionEngine.getRecommendations('START', 'beginner', mlActions);
    expect(actions).toEqual(mlActions);
    expect(actions[0].id).toBe('ml_1');
  });

  it('should fallback to rules if ML actions are empty', () => {
    const actions = DecisionEngine.getRecommendations('START', 'beginner', []);
    expect(actions[0].id).toBe('check_status');
  });
});
