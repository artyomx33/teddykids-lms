import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import { toast } from "sonner";

interface ConnectGmailButtonProps {
  onConnect: () => Promise<any>;
  isConnecting: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
}

export const ConnectGmailButton = ({ 
  onConnect, 
  isConnecting, 
  variant = "default",
  size = "default",
  showIcon = true 
}: ConnectGmailButtonProps) => {
  const handleConnect = async () => {
    try {
      await onConnect();
      toast.success('Gmail account connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect Gmail account');
      console.error('Gmail connection error:', error);
    }
  };

  if (size === "sm") {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        variant={variant}
        size={size}
        className="h-6 w-6 p-0"
      >
        {isConnecting ? (
          <Mail className="h-4 w-4 animate-pulse" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      {isConnecting ? (
        <>
          <Mail className="h-4 w-4 animate-pulse" />
          Connecting...
        </>
      ) : (
        <>
          {showIcon && <Plus className="h-4 w-4" />}
          Connect Gmail Account
        </>
      )}
    </Button>
  );
};