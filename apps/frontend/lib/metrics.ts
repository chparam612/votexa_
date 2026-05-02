const isNode =
  typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export const recordMetric = async (
  metricType: string,
  value: number,
  labels: Record<string, string> = {},
) => {
  if (isNode) {
    try {
      const { MetricServiceClient } = eval('require')('@google-cloud/monitoring');
      const path = eval('require')('path');
      const fs = eval('require')('fs');

      const isCloudRun = !!process.env.K_SERVICE;
      const options: any = {};

      if (!isCloudRun) {
        const keyPath =
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          path.resolve(process.cwd(), '../../service-account.json');
        if (fs.existsSync(keyPath)) {
          options.keyFilename = keyPath;
        }
      }

      const client = new MetricServiceClient(options);

      const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c';

      const dataPoint = {
        interval: {
          endTime: {
            seconds: Math.floor(Date.now() / 1000),
          },
        },
        value: {
          doubleValue: value,
        },
      };

      const timeSeriesData = {
        metric: {
          type: `custom.googleapis.com/votexa/${metricType}`,
          labels,
        },
        resource: {
          type: 'global',
          labels: { project_id: projectId },
        },
        points: [dataPoint],
      };

      await client.createTimeSeries({
        name: client.projectPath(projectId),
        timeSeries: [timeSeriesData],
      });
    } catch {
      // Silent fail to prevent blocking execution
    }
  }
};
