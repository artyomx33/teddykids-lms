import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import { toast } from "sonner";

interface ConnectGmailButtonProps {
  onConnect: () => Promise<any>;
  isConnecting: boolean;
}

export const ConnectGmailButton = ({ onConnect, isConnecting }: ConnectGmailButtonProps) => {
  const handleConnect = async () => {
    try {
      await onConnect();
      toast.success('Gmail account connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect Gmail account');
      console.error('Gmail connection error:', error);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-primary hover:bg-primary/90"
    >
      {isConnecting ? (
        <>
          <Mail className="h-4 w-4 animate-pulse" />
          Connecting...
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          Connect Gmail Account
        </>
      )}
    </Button>
  );
};