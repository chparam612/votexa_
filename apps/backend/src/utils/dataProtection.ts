/**
 * Mask sensitive user data in logs and responses
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***@***.com';
  const [name, domain] = email.split('@');
  if (!name || !domain) return '***@***.com';
  return `${name.charAt(0)}***@${domain}`;
};

export const maskUserId = (userId: string): string => {
  if (!userId) return '****';
  if (userId.length <= 8) return '****' + userId.slice(-2);
  return `${userId.substring(0, 4)}...${userId.substring(userId.length - 4)}`;
};

/**
 * Remove PII from response objects
 */
export const stripPII = (data: Record<string, any>): Record<string, any> => {
  const sensitiveFields = ['password', 'token', 'ssn', 'credit_card', 'private_key', 'secret'];
  const cleaned = { ...data };

  sensitiveFields.forEach(field => {
    if (cleaned[field]) {
      delete cleaned[field];
    }
  });

  return cleaned;
};

/**
 * Safe logging - never log PII
 */
export const createSafeLog = (context: string, data: Record<string, any>) => {
  const safeData = stripPII(data);
  if (safeData.userId) safeData.userId = maskUserId(safeData.userId);
  if (safeData.uid) safeData.uid = maskUserId(safeData.uid);
  if (safeData.email) safeData.email = maskEmail(safeData.email);
  return { context, data: safeData, timestamp: new Date().toISOString() };
};
