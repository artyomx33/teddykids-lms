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

  // Get redirect URI - prefer custom domain if available
  const REDIRECT_URI = `${window.location.origin}/gmail-callback`;
  const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  const connectGmailAccount = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      // Get Gmail client ID from Edge Function
      const { data: configData, error: configError } = await supabase.functions.invoke('gmail-config', {
        body: {}
      });

      if (configError || !configData?.client_id) {
        throw new Error('Failed to get Gmail configuration');
      }

      const clientId = configData.client_id;

      // Store current page to return to after OAuth
      localStorage.setItem('gmail_oauth_return_url', window.location.href);

      // Create OAuth URL for redirect flow
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', SCOPES);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', `redirect_${Date.now()}`);

      // Redirect to Google OAuth
      window.location.href = authUrl.toString();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Gmail connection error:', error);
      setIsConnecting(false);
      throw error;
    }
  }, [REDIRECT_URI, SCOPES]);

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