import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GmailAccount {
  id: string;
  email_address: string;
  display_name?: string;
  is_active: boolean;
  last_sync_at?: string;
}

export const useGmailAuth = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // We'll get the client ID from the Edge Function since it has access to secrets
  const REDIRECT_URI = `${window.location.origin}/gmail-callback`;
  const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
  ].join(' ');

  const connectGmailAccount = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      // Get Gmail client ID from Edge Function (which has access to secrets)
      const { data: configData, error: configError } = await supabase.functions.invoke('gmail-config', {
        body: {}
      });

      if (configError || !configData?.client_id) {
        throw new Error('Failed to get Gmail configuration');
      }

      // Create OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', configData.client_id);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', SCOPES);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', `user_${Date.now()}`);

      // Open OAuth popup
      const popup = window.open(
        authUrl.toString(),
        'gmail_oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for popup completion
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            reject(new Error('OAuth popup was closed'));
          }
        }, 1000);

        // Listen for message from popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', messageListener);
            setIsConnecting(false);
            resolve(event.data.account);
            fetchAccounts();
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', messageListener);
            setIsConnecting(false);
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageListener);
      });
    } catch (error) {
      setIsConnecting(false);
      throw error;
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gmail_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching Gmail accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectAccount = useCallback(async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('gmail_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      throw error;
    }
  }, [fetchAccounts]);

  const syncAccount = useCallback(async (accountId: string) => {
    try {
      // Get account with access token
      const { data: account, error } = await supabase
        .from('gmail_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (error) throw error;

      // Call sync function
      const { data: result, error: syncError } = await supabase.functions.invoke('gmail-integration', {
        body: {
          action: 'sync_emails',
          accountId: account.id,
          accessToken: account.access_token
        }
      });

      if (syncError) throw syncError;
      return result;
    } catch (error) {
      console.error('Error syncing account:', error);
      throw error;
    }
  }, []);

  return {
    isConnecting,
    accounts,
    isLoading,
    connectGmailAccount,
    disconnectAccount,
    syncAccount,
    fetchAccounts
  };
};