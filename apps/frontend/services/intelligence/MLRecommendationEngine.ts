import { ActionRecommendation } from '../../../../packages/algorithms/src/DecisionEngine';
import { VoterState } from '../../../../packages/algorithms/src/StateMachine';

const isNode =
  typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export interface VoterFeatures {
  voterState: VoterState;
  riskScore: number;
  daysToElection: number;
  experienceLevel: 'beginner' | 'experienced';
  completedSteps: string[];
  district: string;
}

export interface MLPrediction {
  actions: ActionRecommendation[];
  predictedDropoffRisk: number;
  recommendedPath: string;
}

export class MLRecommendationEngine {
  public static async predictNextActions(features: VoterFeatures): Promise<MLPrediction | null> {
    if (!isNode) return null;
    try {
      const { VertexAI } = eval('require')('@google-cloud/vertexai');
      const project = process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c';
      const location = 'asia-south1';

      const vertex_ai = new VertexAI({ project, location });
      const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: 'gemini-1.5-pro-preview-0409',
        generationConfig: {
          temperature: 0.2,
        },
      });

      const prompt = `
        Given a voter with the following features:
        ${JSON.stringify(features)}
        Predict the best next actions to reduce dropoff risk.
        Return ONLY a JSON object with this exact schema:
        {
          "actions": [{ "id": "...", "title": "...", "description": "...", "priority": "HIGH|MEDIUM|LOW", "event": "..." }],
          "predictedDropoffRisk": 0.0-1.0,
          "recommendedPath": "..."
        }
      `;

      const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
      const result = await generativeModel.generateContent(request);
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (responseText) {
        // Strip markdown code block ticks if any
        const cleanedText = responseText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const parsed = JSON.parse(cleanedText) as MLPrediction;
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Vertex AI prediction failed, falling back to DecisionEngine:', error);
      return null;
    }
  }
}
