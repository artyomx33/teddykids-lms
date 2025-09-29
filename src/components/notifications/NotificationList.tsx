import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  FileText,
  Calendar,
  Users,
  CheckCircle2,
  X
} from 'lucide-react';
import { Notification, markNotificationAsRead, archiveNotification, markAllNotificationsAsRead } from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface NotificationListProps {
  notifications: Notification[];
  onUpdate: () => void;
  onClose: () => void;
}

export function NotificationList({ notifications, onUpdate, onClose }: NotificationListProps) {
  const navigate = useNavigate();

  const getIcon = (type: Notification['type'], severity: Notification['severity']) => {
    if (severity === 'critical') return <AlertCircle className="h-5 w-5 text-destructive" />;
    if (severity === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    
    switch (type) {
      case 'chain_rule':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'termination_notice':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'contract_expiry':
        return <Calendar className="h-5 w-5 text-red-500" />;
      case 'document_missing':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case 'review_due':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-l-destructive';
      case 'warning': return 'border-l-4 border-l-amber-500';
      case 'info': return 'border-l-4 border-l-blue-500';
      default: return '';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      onUpdate();
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const handleArchive = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await archiveNotification(notificationId);
      onUpdate();
      toast({
        title: 'Archived',
        description: 'Notification has been archived'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive notification',
        variant: 'destructive'
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      onUpdate();
      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>
      <Separator />
      
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No notifications</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-colors
                  ${!notification.isRead ? 'bg-accent/50' : 'hover:bg-accent/30'}
                  ${getSeverityColor(notification.severity)}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getIcon(notification.type, notification.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm leading-tight">
                        {notification.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => handleArchive(notification.id, e)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        notification.severity === 'critical' ? 'destructive' :
                        notification.severity === 'warning' ? 'default' :
                        'secondary'
                      } className="text-xs">
                        {notification.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
