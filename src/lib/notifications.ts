import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  userId: string;
  type: 'chain_rule' | 'termination_notice' | 'contract_expiry' | 'document_missing' | 'review_due';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  actionUrl?: string;
  metadata: Record<string, any>;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Fetch notifications for the current user
 */
export async function fetchNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data.map(n => ({
    id: n.id,
    userId: n.user_id,
    type: n.type,
    severity: n.severity,
    title: n.title,
    message: n.message,
    actionUrl: n.action_url,
    metadata: n.metadata || {},
    isRead: n.is_read,
    isArchived: n.is_archived,
    createdAt: n.created_at,
    expiresAt: n.expires_at
  }));
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Archive notification
 */
export async function archiveNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_archived: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error archiving notification:', error);
    throw error;
  }
}

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  type: Notification['type'],
  severity: Notification['severity'],
  title: string,
  message: string,
  actionUrl?: string,
  metadata?: Record<string, any>,
  expiresAt?: Date
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      severity,
      title,
      message,
      action_url: actionUrl,
      metadata: metadata || {},
      expires_at: expiresAt?.toISOString()
    });

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  const channel = supabase
    .channel('notifications-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const n = payload.new;
        callback({
          id: n.id,
          userId: n.user_id,
          type: n.type,
          severity: n.severity,
          title: n.title,
          message: n.message,
          actionUrl: n.action_url,
          metadata: n.metadata || {},
          isRead: n.is_read,
          isArchived: n.is_archived,
          createdAt: n.created_at,
          expiresAt: n.expires_at
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
