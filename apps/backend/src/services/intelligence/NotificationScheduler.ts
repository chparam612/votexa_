import { TaskQueueService, NotificationPayload } from './TaskQueueService';

export class NotificationScheduler {
  public static async scheduleAlert(userId: string, title: string, body: string, delaySeconds: number): Promise<boolean> {
    const scheduledFor = Math.floor(Date.now() / 1000) + delaySeconds;
    const id = `alert-${userId}-${scheduledFor}`;
    
    const payload: NotificationPayload = {
      id,
      userId,
      title,
      body,
      channels: ['push'],
      scheduledFor,
    };
    
    return TaskQueueService.scheduleNotification(payload);
  }
}
