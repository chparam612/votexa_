export type VoterState = 
  | 'START' 
  | 'NOT_REGISTERED' 
  | 'REGISTERED' 
  | 'VERIFIED' 
  | 'READY' 
  | 'VOTED' 
  | 'DISQUALIFIED';

export type VoterEvent = 
  | 'CHECK_STATUS' 
  | 'SUBMIT_FORM' 
  | 'APPROVE_REGISTRATION' 
  | 'VERIFY_IDENTITY' 
  | 'FIND_POLLING_STATION' 
  | 'CAST_VOTE' 
  | 'VIOLATION_DETECTED';

export const STATE_PROGRESS: Record<VoterState, number> = {
  START: 0,
  NOT_REGISTERED: 10,
  REGISTERED: 40,
  VERIFIED: 70,
  READY: 90,
  VOTED: 100,
  DISQUALIFIED: 0,
};

export const STATE_META: Record<VoterState, { label: string; icon: string; color: string }> = {
  START: { label: 'Get Started', icon: 'flag', color: '#94A3B8' },
  NOT_REGISTERED: { label: 'Not Registered', icon: 'person-add', color: '#F59E0B' },
  REGISTERED: { label: 'Registered', icon: 'document-text', color: '#3B82F6' },
  VERIFIED: { label: 'Verified', icon: 'shield-checkmark', color: '#6366F1' },
  READY: { label: 'Ready to Vote', icon: 'checkmark-circle', color: '#10B981' },
  VOTED: { label: 'Voted', icon: 'finger-print', color: '#059669' },
  DISQUALIFIED: { label: 'Disqualified', icon: 'close-circle', color: '#EF4444' },
};

const TRANSITIONS: Record<VoterState, Partial<Record<VoterEvent, VoterState>>> = {
  START: {
    CHECK_STATUS: 'NOT_REGISTERED',
  },
  NOT_REGISTERED: {
    SUBMIT_FORM: 'REGISTERED',
  },
  REGISTERED: {
    APPROVE_REGISTRATION: 'VERIFIED',
    VIOLATION_DETECTED: 'DISQUALIFIED',
  },
  VERIFIED: {
    FIND_POLLING_STATION: 'READY',
    VIOLATION_DETECTED: 'DISQUALIFIED',
  },
  READY: {
    CAST_VOTE: 'VOTED',
    VIOLATION_DETECTED: 'DISQUALIFIED',
  },
  VOTED: {},
  DISQUALIFIED: {},
};

/**
 * Manages voter state transitions throughout the election process.
 * 
 * State flow: START → NOT_REGISTERED → REGISTERED → VERIFIED → READY → VOTED
 * 
 * @example
 * const fsm = StateMachine.fromState('START');
 * fsm.handle('CHECK_STATUS'); // transition to NOT_REGISTERED
 * 
 * @public
 */
export class StateMachine {
  private currentState: VoterState;
  private history: VoterState[] = [];

  private constructor(initialState: VoterState) {
    this.currentState = initialState;
    this.history.push(initialState);
  }

  /**
   * Factory method to create a StateMachine starting from a specific state.
   * @param state - The initial state for the machine.
   * @returns A new StateMachine instance.
   */
  public static fromState(state: VoterState): StateMachine {
    return new StateMachine(state);
  }

  /**
   * Handles an event and transitions to the next state.
   * Alias for transition to match master prompt spec.
   * @param event - The triggering event.
   * @returns The new voter state.
   * @throws {Error} If transition is invalid for current state.
   */
  public handle(event: VoterEvent): VoterState {
    return this.transition(event);
  }

  /**
   * Performs the state transition logic based on the input event.
   * @param event - The event that triggers the state change.
   * @returns The updated voter state.
   * @throws {Error} If the transition is not allowed.
   */
  public transition(event: VoterEvent): VoterState {
    const validTransitions = TRANSITIONS[this.currentState];
    if (validTransitions && validTransitions[event]) {
      const nextState = validTransitions[event] as VoterState;
      this.currentState = nextState;
      this.history.push(nextState);
      return this.currentState;
    }
    throw new Error(`Invalid transition: Cannot process event ${event} from state ${this.currentState}`);
  }

  /**
   * Retrieves the current state of the voter.
   * @returns The current VoterState.
   */
  public getState(): VoterState {
    return this.currentState;
  }

  /**
   * Retrieves the full transition history.
   * @returns An array of states visited.
   */
  public getHistory(): VoterState[] {
    return [...this.history];
  }

  /**
   * Gets the numerical progress (0-100) associated with the current state.
   * @returns Progress percentage.
   */
  public getProgress(): number {
    return STATE_PROGRESS[this.currentState];
  }

  /**
   * Gets UI-specific metadata for the current state.
   * @returns Metadata containing label, icon, and color.
   */
  public getMeta() {
    return STATE_META[this.currentState];
  }

  /**
   * Reverts the machine to the previous state in history.
   * @returns The state after rollback.
   */
  public rollback(): VoterState {
    if (this.history.length > 1) {
      this.history.pop();
      this.currentState = this.history[this.history.length - 1] as VoterState;
    }
    return this.currentState;
  }
}
