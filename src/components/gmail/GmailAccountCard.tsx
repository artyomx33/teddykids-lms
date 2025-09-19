import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, RefreshCw, Unlink, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GmailAccountCardProps {
  account: {
    id: string;
    email_address: string;
    display_name?: string;
    is_active: boolean;
    last_sync_at?: string;
  };
  onDisconnect: (accountId: string) => Promise<void>;
  onSync: (accountId: string, onProgress?: (progress: { processed: number, total: number, message: string }) => void) => Promise<any>;
}

export const GmailAccountCard = ({ account, onDisconnect, onSync }: GmailAccountCardProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ processed: number, total: number, message: string } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncProgress({ processed: 0, total: 0, message: 'Initializing...' });
    
    try {
      const result = await onSync(account.id, (progress) => {
        setSyncProgress(progress);
      });
      
      const syncType = result.incremental ? 'incremental' : 'full';
      toast.success(`${syncType.charAt(0).toUpperCase() + syncType.slice(1)} sync completed: ${result.count || 0} emails`);
    } catch (error) {
      toast.error('Failed to sync emails');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await onDisconnect(account.id);
      toast.success('Account disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect account');
      console.error('Disconnect error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never synced';
    const date = new Date(lastSync);
    return `Last synced: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{account.display_name || account.email_address}</CardTitle>
              <p className="text-sm text-muted-foreground">{account.email_address}</p>
            </div>
          </div>
          <Badge variant={account.is_active ? "default" : "secondary"} className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Progress indicator during sync */}
        {isSyncing && syncProgress && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{syncProgress.message}</span>
              {syncProgress.total > 0 && (
                <span className="text-muted-foreground">
                  {syncProgress.processed}/{syncProgress.total}
                </span>
              )}
            </div>
            {syncProgress.total > 0 && (
              <Progress 
                value={(syncProgress.processed / syncProgress.total) * 100} 
                className="h-2"
              />
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {formatLastSync(account.last_sync_at)}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing || isDisconnecting}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting || isSyncing}
              className="flex items-center gap-1 text-destructive hover:text-destructive"
            >
              <Unlink className="h-3 w-3" />
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};