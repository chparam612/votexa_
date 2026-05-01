import { VoterState } from './StateMachine';

export type ExperienceLevel = 'beginner' | 'experienced';

export interface ActionRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  event: string;
}

export class DecisionEngine {
  public static getRuleBasedActions(
    state: VoterState,
    experience: ExperienceLevel,
  ): ActionRecommendation[] {
    switch (state) {
      case 'START':
        return [
          {
            id: 'check_status',
            title: 'Check Registration Status',
            description: 'Find out if you are already registered to vote.',
            priority: 'HIGH',
            event: 'CHECK_STATUS',
          },
        ];
      case 'NOT_REGISTERED':
        return [
          {
            id: 'submit_form',
            title: 'Submit Voter Registration',
            description:
              experience === 'beginner'
                ? 'Complete Form 6 to register as a new voter. Need help? Try the AI assistant.'
                : 'Submit Form 6 online via the NVSP portal.',
            priority: 'HIGH',
            event: 'SUBMIT_FORM',
          },
        ];
      case 'REGISTERED':
        return [
          {
            id: 'approve_reg',
            title: 'Track Application',
            description: 'Track the status of your submitted application.',
            priority: 'MEDIUM',
            event: 'APPROVE_REGISTRATION',
          },
        ];
      case 'VERIFIED':
        return [
          {
            id: 'find_polling',
            title: 'Find Polling Station',
            description: 'Locate your assigned polling booth and check the wait times.',
            priority: 'HIGH',
            event: 'FIND_POLLING_STATION',
          },
        ];
      case 'READY':
        return [
          {
            id: 'cast_vote',
            title: 'Cast Your Vote',
            description: 'Go to your polling station and cast your vote today!',
            priority: 'CRITICAL',
            event: 'CAST_VOTE',
          },
        ];
      default:
        return [];
    }
  }

  public static getRecommendations(
    state: VoterState,
    experience: ExperienceLevel,
    mlActions?: ActionRecommendation[],
  ): ActionRecommendation[] {
    if (mlActions && mlActions.length > 0) {
      return mlActions; // ML took precedence
    }
    return this.getRuleBasedActions(state, experience);
  }
}
