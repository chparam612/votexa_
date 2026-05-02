import { DecisionEngine } from '../DecisionEngine';

describe('DecisionEngine', () => {
  const mockVoterState = 'REGISTERED';
  
  test('should return HIGH priority actions for beginner voters', () => {
    const actions = DecisionEngine.getRuleBasedActions('NOT_REGISTERED', 'beginner');
    const highPriority = actions.filter(a => a.priority === 'HIGH');
    expect(highPriority.length).toBeGreaterThan(0);
    expect(highPriority[0].id).toBe('register_now');
  });

  test('should recommend verification for REGISTERED voters', () => {
    const actions = DecisionEngine.getRuleBasedActions('REGISTERED', 'beginner');
    expect(actions.some(a => a.id === 'check_verification')).toBe(true);
  });

  test('should recommend polling station search for READY voters', () => {
    const actions = DecisionEngine.getRuleBasedActions('READY', 'experienced');
    expect(actions.some(a => a.id === 'find_polling_station')).toBe(true);
  });

  test('should recommend sharing for VOTED voters', () => {
    const actions = DecisionEngine.getRuleBasedActions('VOTED', 'experienced');
    expect(actions.some(a => a.id === 'share_badge')).toBe(true);
  });

  // Adding 10+ edge case tests for DecisionEngine
  const states = ['NOT_REGISTERED', 'REGISTERED', 'VERIFIED', 'READY', 'VOTED', 'DISQUALIFIED'];
  states.forEach(state => {
    test(`should return valid actions for state: ${state}`, () => {
      const actions = DecisionEngine.getRuleBasedActions(state as any, 'beginner');
      expect(Array.isArray(actions)).toBe(true);
      actions.forEach(action => {
        expect(action).toHaveProperty('id');
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('priority');
      });
    });
  });

  test('should handle unknown states gracefully', () => {
    const actions = DecisionEngine.getRuleBasedActions('UNKNOWN' as any, 'beginner');
    expect(actions.length).toBe(0);
  });
});
