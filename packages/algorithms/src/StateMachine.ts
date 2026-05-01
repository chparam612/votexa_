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

export class StateMachine {
  private currentState: VoterState;

  private constructor(initialState: VoterState) {
    this.currentState = initialState;
  }

  public static fromState(state: VoterState): StateMachine {
    return new StateMachine(state);
  }

  public transition(event: VoterEvent): VoterState {
    const validTransitions = TRANSITIONS[this.currentState];
    if (validTransitions && validTransitions[event]) {
      this.currentState = validTransitions[event] as VoterState;
      return this.currentState;
    }
    throw new Error(`Invalid transition: Cannot process event ${event} from state ${this.currentState}`);
  }

  public getState(): VoterState {
    return this.currentState;
  }

  public getProgress(): number {
    return STATE_PROGRESS[this.currentState];
  }

  public getMeta() {
    return STATE_META[this.currentState];
  }
}
