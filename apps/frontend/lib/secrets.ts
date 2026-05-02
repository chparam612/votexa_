const secretsCache: Record<string, string> = {};

export const getSecret = async (name: string): Promise<string> => {
  if (secretsCache[name]) return secretsCache[name];

  // Only attempt node-specific logic if we are actually in a Node environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
      const client = new SecretManagerServiceClient();
      const [version] = await client.accessSecretVersion({
        name: `projects/votexa-ac15c/secrets/${name}/versions/latest`,
      });
      const payload = version.payload?.data?.toString();
      if (payload) {
        secretsCache[name] = payload;
        return payload;
      }
    } catch {
      // Silent fail
    }
  }

  // Fallback to process.env (works in both Node and Expo via babel-plugin-transform-inline-environment-variables)
  return process.env[name] || '';
};
