export const validateTransitionEvent = (event: string): boolean => {
  const validEvents = ['CHECK_STATUS', 'SUBMIT_FORM', 'APPROVE_REGISTRATION', 'FIND_POLLING_STATION', 'CAST_VOTE', 'VIOLATION_DETECTED'];
  return validEvents.includes(event);
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateUserId = (userId: string): boolean => {
  return userId.length > 0 && userId.length <= 128;
};
