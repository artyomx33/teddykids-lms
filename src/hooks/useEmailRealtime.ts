import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useGmailAuth } from "./useGmailAuth";
import { toast } from "sonner";

interface EmailRealtimeHook {
  isConnected: boolean;
  lastUpdate: Date | null;
}

export const useEmailRealtime = (onEmailUpdate?: () => void): EmailRealtimeHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { accounts } = useGmailAuth();

  useEffect(() => {
    if (accounts.length === 0) return;

    console.log('Setting up email real-time subscriptions...');

    // Subscribe to email changes
    const emailChannel = supabase
      .channel('email-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails',
          filter: `gmail_account_id=in.(${accounts.map(acc => acc.id).join(',')})`
        },
        (payload) => {
          console.log('Real-time email update:', payload);
          setLastUpdate(new Date());
          
          // Call the update callback
          onEmailUpdate?.();
          
          // Show toast for new emails
          if (payload.eventType === 'INSERT' && payload.new) {
            const email = payload.new;
            if (!email.is_read) {
              toast.info(
                `New email from ${email.sender_name || email.sender_email}`,
                {
                  description: email.subject,
                  duration: 5000,
                }
              );
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_drafts',
          filter: `gmail_account_id=in.(${accounts.map(acc => acc.id).join(',')})`
        },
        (payload) => {
          console.log('Real-time draft update:', payload);
          setLastUpdate(new Date());
          onEmailUpdate?.();
        }
      )
      .on('system', {}, (payload) => {
        console.log('Real-time system event:', payload);
        if (payload.status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Real-time subscription active');
        } else if (payload.status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('Real-time subscription error');
        }
      })
      .subscribe();

    return () => {
      console.log('Cleaning up email real-time subscriptions...');
      emailChannel.unsubscribe();
      setIsConnected(false);
    };
  }, [accounts, onEmailUpdate]);

  return {
    isConnected,
    lastUpdate
  };
};