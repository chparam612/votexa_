const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export const log = (level: LogLevel, message: string, metadata: Record<string, any> = {}) => {
  if (isNode) {
    try {
      const { Logging } = eval('require')('@google-cloud/logging');
      const logging = new Logging({ projectId: process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c' });
      const log = logging.log('votexa-app-log');
      
      const text = `${message}`;
      const jsonPayload = {
        message: text,
        ...metadata,
      };

      const severityMap: Record<LogLevel, any> = {
        DEBUG: 'DEBUG',
        INFO: 'INFO',
        WARNING: 'WARNING',
        ERROR: 'ERROR',
        CRITICAL: 'CRITICAL',
      };

      const entry = log.entry({ severity: severityMap[level] }, jsonPayload);
      
      // We don't await this to avoid blocking
      log.write(entry).catch((e: any) => console.error('Failed to write log', e));
      
      if (level === 'ERROR' || level === 'CRITICAL') {
        // Also log to Error Reporting
        console.error(`[${level}] ${message}`, metadata);
      }
    } catch (error) {
      console.error('Logging setup failed', error);
      console.log(`[${level}] ${message}`, metadata);
    }
  } else {
    // Frontend logging
    if (level === 'ERROR' || level === 'CRITICAL') {
      console.error(`[${level}] ${message}`, metadata);
    } else if (level === 'WARNING') {
      console.warn(`[${level}] ${message}`, metadata);
    } else {
      console.log(`[${level}] ${message}`, metadata);
    }
  }
};
