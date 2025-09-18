import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  onSync: (accountId: string) => Promise<any>;
}

export const GmailAccountCard = ({ account, onDisconnect, onSync }: GmailAccountCardProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await onSync(account.id);
      toast.success(`Synced ${result.count || 0} emails successfully`);
    } catch (error) {
      toast.error('Failed to sync emails');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
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
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {formatLastSync(account.last_sync_at)}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
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