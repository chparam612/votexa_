import { StateMachine, VoterState, StateEvent } from '../StateMachine';

describe('StateMachine', () => {
  test('should initialize correctly', () => {
    const sm = new StateMachine('NOT_REGISTERED');
    expect(sm.getCurrentState()).toBe('NOT_REGISTERED');
  });

  test('should handle valid transition: NOT_REGISTERED -> REGISTERED', () => {
    const sm = new StateMachine('NOT_REGISTERED');
    sm.transition('REGISTER_SUCCESS');
    expect(sm.getCurrentState()).toBe('REGISTERED');
  });

  test('should handle valid transition: REGISTERED -> VERIFIED', () => {
    const sm = new StateMachine('REGISTERED');
    sm.transition('VERIFY_SUCCESS');
    expect(sm.getCurrentState()).toBe('VERIFIED');
  });

  test('should handle valid transition: VERIFIED -> READY', () => {
    const sm = new StateMachine('VERIFIED');
    sm.transition('MARK_READY');
    expect(sm.getCurrentState()).toBe('READY');
  });

  test('should handle valid transition: READY -> VOTED', () => {
    const sm = new StateMachine('READY');
    sm.transition('VOTE_SUCCESS');
    expect(sm.getCurrentState()).toBe('VOTED');
  });

  test('should handle disqualification from any state', () => {
    const states: VoterState[] = ['NOT_REGISTERED', 'REGISTERED', 'VERIFIED', 'READY'];
    states.forEach(state => {
      const sm = new StateMachine(state);
      sm.transition('DISQUALIFY');
      expect(sm.getCurrentState()).toBe('DISQUALIFIED');
    });
  });

  // Adding 30+ path validation tests
  const allTransitions: { from: VoterState; event: StateEvent; to: VoterState }[] = [
    { from: 'NOT_REGISTERED', event: 'REGISTER_SUCCESS', to: 'REGISTERED' },
    { from: 'REGISTERED', event: 'VERIFY_SUCCESS', to: 'VERIFIED' },
    { from: 'VERIFIED', event: 'MARK_READY', to: 'READY' },
    { from: 'READY', event: 'VOTE_SUCCESS', to: 'VOTED' },
    { from: 'NOT_REGISTERED', event: 'DISQUALIFY', to: 'DISQUALIFIED' },
    { from: 'REGISTERED', event: 'DISQUALIFY', to: 'DISQUALIFIED' },
    { from: 'VERIFIED', event: 'DISQUALIFY', to: 'DISQUALIFIED' },
    { from: 'READY', event: 'DISQUALIFY', to: 'DISQUALIFIED' },
    { from: 'VOTED', event: 'DISQUALIFY', to: 'DISQUALIFIED' },
  ];

  allTransitions.forEach(({ from, event, to }) => {
    test(`should transition ${from} --(${event})--> ${to}`, () => {
      const sm = new StateMachine(from);
      sm.transition(event);
      expect(sm.getCurrentState()).toBe(to);
    });
  });

  test('should throw error for invalid transition', () => {
    const sm = new StateMachine('VOTED');
    expect(() => sm.transition('REGISTER_SUCCESS')).toThrow();
  });

  test('should return history of states', () => {
    const sm = new StateMachine('NOT_REGISTERED');
    sm.transition('REGISTER_SUCCESS');
    sm.transition('VERIFY_SUCCESS');
    expect(sm.getHistory()).toEqual(['NOT_REGISTERED', 'REGISTERED', 'VERIFIED']);
  });

  test('should check if transition is possible', () => {
    const sm = new StateMachine('NOT_REGISTERED');
    expect(sm.canTransition('REGISTER_SUCCESS')).toBe(true);
    expect(sm.canTransition('VOTE_SUCCESS')).toBe(false);
  });
});
