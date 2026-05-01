const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export interface PushMessage {
  userId: string;
  title: string;
  body: string;
  channels: string[];
}

export class PushService {
  public static async send(message: PushMessage): Promise<boolean> {
    if (!isNode) return false;
    try {
      const admin = eval('require')('firebase-admin');
      const db = admin.firestore();
      
      const userDoc = await db.collection('users').doc(message.userId).get();
      if (!userDoc.exists) return false;
      
      const fcmToken = userDoc.data()?.fcmToken;
      if (!fcmToken) return false;

      const payload = {
        notification: {
          title: message.title,
          body: message.body,
        },
        token: fcmToken,
      };

      await admin.messaging().send(payload);
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  public static async sendBatch(messages: PushMessage[]): Promise<boolean> {
    if (!isNode || messages.length === 0) return false;
    try {
      const admin = eval('require')('firebase-admin');
      const db = admin.firestore();
      
      const userIds = messages.map(m => m.userId);
      // For simplicity in batch, we fetch users one by one or in small batches
      // Here we just use a Promise.all for demonstration
      const userDocs = await Promise.all(userIds.map(id => db.collection('users').doc(id).get()));
      
      const tokensMap = new Map<string, string>();
      userDocs.forEach(doc => {
        if (doc.exists && doc.data()?.fcmToken) {
          tokensMap.set(doc.id, doc.data()!.fcmToken);
        }
      });

      const validPayloads = messages
        .filter(m => tokensMap.has(m.userId))
        .map(m => ({
          notification: {
            title: m.title,
            body: m.body,
          },
          token: tokensMap.get(m.userId)!,
        }));

      if (validPayloads.length > 0) {
        await admin.messaging().sendEach(validPayloads);
      }
      return true;
    } catch (error) {
      console.error('Failed to send batch push notifications:', error);
      return false;
    }
  }
}
