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
  
  console.log('Gmail OAuth REDIRECT_URI:', REDIRECT_URI);

  const connectGmailAccount = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      console.log('🚀 Starting Gmail OAuth flow...');
      
      // Get Gmail client ID from Edge Function (which has access to secrets)
      console.log('📡 Fetching Gmail config...');
      const { data: configData, error: configError } = await supabase.functions.invoke('gmail-config', {
        body: {}
      });

      if (configError || !configData?.client_id) {
        console.error('❌ Config error:', configError, configData);
        throw new Error('Failed to get Gmail configuration');
      }

      const clientId = configData.client_id;
      console.log('✅ Got client ID:', clientId?.substring(0, 20) + '...');

      // Store current page to return to after OAuth
      localStorage.setItem('gmail_oauth_return_url', window.location.href);

      // Create OAuth URL for redirect flow (more reliable than popup)
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', SCOPES);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', `redirect_${Date.now()}`);

      console.log('🔗 OAuth URL:', authUrl.toString());
      console.log('🔄 REDIRECT_URI:', REDIRECT_URI);
      console.log('🔄 Redirecting to Google OAuth...');

      // Use redirect instead of popup - more reliable
      window.location.href = authUrl.toString();
      
      // This won't execute since we're redirecting
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Gmail connection error:', error);
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