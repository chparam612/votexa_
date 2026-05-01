import { StateMachine, VoterState } from '../StateMachine';

describe('StateMachine', () => {
  it('should initialize with the provided state', () => {
    const fsm = StateMachine.fromState('START');
    expect(fsm.getState()).toBe('START');
  });

  it('should process valid transitions correctly', () => {
    const fsm = StateMachine.fromState('START');

    expect(fsm.transition('CHECK_STATUS')).toBe('NOT_REGISTERED');
    expect(fsm.transition('SUBMIT_FORM')).toBe('REGISTERED');
    expect(fsm.transition('APPROVE_REGISTRATION')).toBe('VERIFIED');
    expect(fsm.transition('FIND_POLLING_STATION')).toBe('READY');
    expect(fsm.transition('CAST_VOTE')).toBe('VOTED');
  });

  it('should reject invalid events from a specific state', () => {
    const fsm = StateMachine.fromState('START');
    expect(() => fsm.transition('CAST_VOTE')).toThrow('Invalid transition');
  });

  it('should transition to DISQUALIFIED from multiple states on VIOLATION_DETECTED', () => {
    const states: VoterState[] = ['REGISTERED', 'VERIFIED', 'READY'];
    states.forEach((state) => {
      const fsm = StateMachine.fromState(state);
      expect(fsm.transition('VIOLATION_DETECTED')).toBe('DISQUALIFIED');
    });
  });

  it('should return correct progress for each state', () => {
    expect(StateMachine.fromState('START').getProgress()).toBe(0);
    expect(StateMachine.fromState('REGISTERED').getProgress()).toBe(40);
    expect(StateMachine.fromState('VOTED').getProgress()).toBe(100);
  });
});
