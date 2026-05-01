const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export interface NotificationPayload {
  id: string;
  userId: string;
  title: string;
  body: string;
  channels: string[];
  scheduledFor: number; // Unix timestamp seconds
}

export class TaskQueueService {
  public static async scheduleNotification(n: NotificationPayload): Promise<boolean> {
    if (!isNode) return false;
    try {
      const { CloudTasksClient } = eval('require')('@google-cloud/tasks');
      const client = new CloudTasksClient();
      
      const project = process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c';
      const queue = 'votexa-notifications';
      const location = 'asia-south1'; // Ensure this matches deployment
      
      const parent = client.queuePath(project, location, queue);
      const taskName = client.taskPath(project, location, queue, n.id);

      const task = {
        name: taskName,
        httpRequest: {
          httpMethod: 'POST',
          url: `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/notifications/deliver`,
          headers: { 'Content-Type': 'application/json' },
          body: Buffer.from(JSON.stringify(n)).toString('base64'),
        },
        scheduleTime: {
          seconds: n.scheduledFor,
        },
      };

      await client.createTask({ parent, task });
      return true;
    } catch (error) {
      console.error('Failed to schedule task:', error);
      return false;
    }
  }

  public static async cancelNotification(id: string): Promise<boolean> {
    if (!isNode) return false;
    try {
      const { CloudTasksClient } = eval('require')('@google-cloud/tasks');
      const client = new CloudTasksClient();
      
      const project = process.env.GOOGLE_CLOUD_PROJECT || 'votexa-ac15c';
      const queue = 'votexa-notifications';
      const location = 'asia-south1';
      
      const taskName = client.taskPath(project, location, queue, id);
      await client.deleteTask({ name: taskName });
      return true;
    } catch (error) {
      console.error('Failed to cancel task:', error);
      return false;
    }
  }
}
