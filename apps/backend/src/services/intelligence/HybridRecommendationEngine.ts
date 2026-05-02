import { MLRecommendationEngine, VoterFeatures } from './MLRecommendationEngine';
import { DecisionEngine, ActionRecommendation } from '@votexa/algorithms';
import { getFlags, trackEvent } from '@votexa/utils';

export class HybridRecommendationEngine {
  public static async getRecommendations(features: VoterFeatures): Promise<ActionRecommendation[]> {
    const flags = await getFlags();
    const useML = flags.use_ml_recommendations;
    const weight = flags.ml_recommendation_weight;

    let actions: ActionRecommendation[] = [];
    let engineUsed = 'rules';

    if (useML && Math.random() < weight) {
      const mlPrediction = await MLRecommendationEngine.predictNextActions(features);
      if (mlPrediction && mlPrediction.actions.length > 0) {
        actions = mlPrediction.actions;
        engineUsed = 'ml';
      }
    }

    if (actions.length === 0) {
      actions = DecisionEngine.getRuleBasedActions(features.voterState, features.experienceLevel);
      engineUsed = 'rules';
    }

    // Log the choice to BigQuery
    trackEvent('recommendation_generated', features.voterState, {
      engine_used: engineUsed,
      action_count: actions.length,
      weight_configured: weight
    }, features.district);

    return actions;
  }
}
