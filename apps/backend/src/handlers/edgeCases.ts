import { log } from '@votexa/utils';

/**
 * Handle network failures and timeouts with exponential backoff
 */
export const handleNetworkFailure = async (
  operation: () => Promise<any>,
  retries = 3,
  backoffMs = 1000
): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = backoffMs * Math.pow(2, i);
      log('WARN', `Operation failed, retrying in ${delay}ms...`, { attempt: i + 1 });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Graceful degradation for API failures with local fallback logic
 */
export const getNearbyStationsWithFallback = async (
  apiCall: () => Promise<any>,
  cachedData: any[]
): Promise<any[]> => {
  try {
    return await apiCall();
  } catch (error) {
    log('ERROR', 'Polling API failed, using fallback data', { error });
    return cachedData || [];
  }
};

/**
 * Validates concurrent state transitions to prevent race conditions
 */
export const checkTransitionLock = async (
  userId: string,
  lastProcessedAt: number,
  lockWindowMs = 2000
): Promise<boolean> => {
  const now = Date.now();
  if (now - lastProcessedAt < lockWindowMs) {
    return false; // Locked
  }
  return true;
};
