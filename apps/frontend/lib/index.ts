const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export const log = async (severity: 'INFO' | 'ERROR' | 'WARNING', message: string, payload: any = {}) => {
  // Always log to local console in dev
  console.log(`[${severity}] ${message}`, payload);

  if (isNode) {
    try {
      const { Logging } = eval('require')('@google-cloud/logging');
      const path = eval('require')('path');
      
      const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(process.cwd(), '../../service-account.json');
      const logging = new Logging({
        keyFilename: keyPath,
      });
      
      const logName = 'votexa-logs';
      const logInstance = logging.log(logName);
      const metadata = {
        resource: { type: 'global' },
        severity: severity,
      };
      const entry = logInstance.entry(metadata, { message, ...payload });
      
      // Attempt to write but don't throw if permissions fail
      await logInstance.write(entry).catch(() => {
        // Silently fail if cloud logging is denied
      });
    } catch (error) {
      // Catch require errors or initialization errors
    }
  }
};

export * from './cache';
export * from './analytics';
export * from './eventBus';
export * from './featureFlags';
export * from './secrets';
export * from './metrics';
export * from './risk';
