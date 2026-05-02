import { log } from '@votexa/utils';

export const logTransition = (userId: string, from: string, to: string, event: string) => {
  log('INFO', 'FSM_TRANSITION', {
    userId,
    from,
    to,
    event,
    timestamp: new Date().toISOString()
  });
};

export const logError = (error: Error, context: string) => {
  log('ERROR', `ERROR_${context}`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};
