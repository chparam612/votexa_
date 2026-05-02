const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export const publishEvent = async (topic: string, payload: any): Promise<void> => {
  if (isNode) {
    const { PubSub } = require('@google-cloud/pubsub');
    const pubsub = new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c' });
    
    try {
      const dataBuffer = Buffer.from(JSON.stringify(payload));
      await pubsub.topic(topic).publishMessage({ data: dataBuffer });
      console.log(`Published event to topic ${topic}`);
    } catch (error) {
      console.error(`Error publishing to topic ${topic}:`, error);
    }
  } else {
    console.warn(`Cannot publish to pubsub from frontend: ${topic}`, payload);
  }
};
