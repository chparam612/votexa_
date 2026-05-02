const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

interface AnalyticsEvent {
  event_type: string;
  user_id: string;
  properties: string; // JSON string
  timestamp: string; // ISO
  district: string;
  state: string;
}

let eventQueue: AnalyticsEvent[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

const flushEvents = async () => {
  if (!isNode || eventQueue.length === 0) return;
  
  const eventsToSend = [...eventQueue];
  eventQueue = [];
  if (batchTimeout) clearTimeout(batchTimeout);
  batchTimeout = null;

  try {
    const { BigQuery } = require('@google-cloud/bigquery');
    const bigquery = new BigQuery({ projectId: process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c' });
    
    await bigquery
      .dataset('votexa_analytics')
      .table('events')
      .insert(eventsToSend);
      
    console.log(`Flushed ${eventsToSend.length} events to BigQuery`);
  } catch (error) {
    console.error('Failed to insert events into BigQuery', error);
  }
};

export const trackEvent = (type: string, userId: string, properties: any, district: string = '', state: string = '') => {
  if (isNode) {
    const event: AnalyticsEvent = {
      event_type: type,
      user_id: userId,
      properties: JSON.stringify(properties),
      timestamp: new Date().toISOString(),
      district,
      state
    };
    
    eventQueue.push(event);
    
    if (eventQueue.length >= 100) {
      flushEvents();
    } else if (!batchTimeout) {
      batchTimeout = setTimeout(flushEvents, 5000);
    }
  } else {
    // Frontend analytics can be sent via an API endpoint, or Firebase Analytics
    console.log(`Frontend trackEvent: ${type}`, properties);
  }
};
