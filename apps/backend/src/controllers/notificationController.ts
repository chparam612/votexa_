import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { PushService } from '../../../../apps/frontend/services/intelligence/PushService';
import { trackEvent } from '../../../../apps/frontend/lib';

export const deliverNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, body, channels } = req.body;
    
    if (channels && channels.includes('push')) {
      const success = await PushService.send({ userId, title, body, channels });
      if (!success) {
        // Return 500 so Cloud Tasks retries
        return res.status(500).json({ error: 'Failed to deliver push notification' });
      }
    }
    
    // Save to Firestore history
    const db = admin.firestore();
    await db.collection('users').doc(userId).collection('notifications').add({
      title,
      body,
      read: false,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Notification delivery error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const registerToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    const { fcmToken } = req.body;
    if (!userId || !fcmToken) return res.status(400).json({ error: 'Missing userId or fcmToken' });

    const db = admin.firestore();
    await db.collection('users').doc(userId).update({ fcmToken });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const fsmWebhook = async (req: Request, res: Response) => {
  try {
    // Decode Pub/Sub message
    const message = req.body.message;
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{}';
    const payload = JSON.parse(data);

    // Track analytics
    trackEvent('fsm_transition_webhook', payload.userId, payload);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const riskAlertWebhook = async (req: Request, res: Response) => {
  try {
    // Handler for risk alerts from Pub/Sub
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
