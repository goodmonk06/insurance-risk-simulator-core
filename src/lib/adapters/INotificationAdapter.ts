/**
 * Notification adapter interface for extensibility
 */

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WEBHOOK = 'WEBHOOK',
  SLACK = 'SLACK',
  IN_APP = 'IN_APP',
  SMS = 'SMS',
}

export interface NotificationPayload {
  to: string | string[];
  subject?: string;
  message: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface INotificationAdapter {
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<void>;
  isAvailable(): Promise<boolean>;
}

// Stub implementation
export class InMemoryNotificationAdapter implements INotificationAdapter {
  readonly channel = NotificationChannel.IN_APP;
  private notifications: any[] = [];

  async send(payload: NotificationPayload): Promise<void> {
    this.notifications.push({
      ...payload,
      sentAt: new Date(),
    });
    console.log(`[IN-APP NOTIFICATION] ${payload.message}`);
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getAll(): any[] {
    return [...this.notifications];
  }

  clear(): void {
    this.notifications = [];
  }
}
