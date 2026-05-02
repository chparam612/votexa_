import { AlertPolicyServiceClient } from '@google-cloud/monitoring';

const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

const createAlerts = async () => {
  if (!isNode) return;
  const client = new AlertPolicyServiceClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c';

  // Just an example structure
  const policy = {
    displayName: 'Votexa High API Latency',
    combiner: 'OR' as const,
    conditions: [
      {
        displayName: 'API p99 > 2000ms',
        conditionThreshold: {
          filter: 'metric.type="custom.googleapis.com/votexa/api_latency"',
          comparison: 'COMPARISON_GT' as const,
          thresholdValue: 2000,
          duration: { seconds: 300 },
          aggregations: [{
            alignmentPeriod: { seconds: 60 },
            perSeriesAligner: 'ALIGN_PERCENTILE_99' as const,
          }]
        }
      }
    ]
  };

  try {
    await client.createAlertPolicy({
      name: client.projectPath(projectId),
      alertPolicy: policy
    });
    console.log('Alert policy created successfully.');
  } catch (error) {
    console.error('Failed to create alert policy', error);
  }
};

createAlerts();
