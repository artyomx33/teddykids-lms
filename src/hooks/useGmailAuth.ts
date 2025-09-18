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

      // Create OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', SCOPES);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', `user_${Date.now()}`);

      console.log('🔗 OAuth URL:', authUrl.toString());
      console.log('🔄 REDIRECT_URI:', REDIRECT_URI);

      // Clear any existing OAuth state
      localStorage.removeItem('gmail_oauth_state');
      localStorage.setItem('gmail_oauth_state', 'pending');

      // Open OAuth popup with better positioning
      console.log('🪟 Opening popup window...');
      const popup = window.open(
        authUrl.toString(),
        'gmail_oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes,left=' + 
        (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 300)
      );

      if (!popup) {
        console.error('❌ Popup blocked!');
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      console.log('✅ Popup opened successfully');

      // Listen for popup completion
      return new Promise((resolve, reject) => {
        let checkCount = 0;
        
        const checkClosed = setInterval(() => {
          checkCount++;
          
          try {
            if (popup?.closed) {
              console.log(`❌ Popup closed after ${checkCount} checks`);
              clearInterval(checkClosed);
              setIsConnecting(false);
              reject(new Error('OAuth popup was closed'));
              return;
            }

            // Try to detect when we're on the callback URL
            try {
              const popupUrl = popup.location.href;
              console.log(`🔍 Check ${checkCount}: Popup URL:`, popupUrl);
              
              if (popupUrl.includes('/gmail-callback')) {
                console.log('🎯 Detected callback URL in popup');
              }
            } catch (e) {
              // Cross-origin error is expected when on Google's domain
              console.log(`🔍 Check ${checkCount}: Cross-origin (expected on Google domain)`);
            }
          } catch (e) {
            console.error('Error in popup check:', e);
          }
        }, 1000);

        // Listen for message from popup
        const messageListener = (event: MessageEvent) => {
          console.log('📨 Received message from popup:', event.data);
          
          if (event.origin !== window.location.origin) {
            console.log('❌ Message from wrong origin:', event.origin, 'expected:', window.location.origin);
            return;
          }
          
          if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
            console.log('✅ OAuth SUCCESS received!', event.data.account);
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', messageListener);
            setIsConnecting(false);
            resolve(event.data.account);
            fetchAccounts();
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            console.error('❌ OAuth ERROR received:', event.data.error);
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener('message', messageListener);
            setIsConnecting(false);
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageListener);
        
        // Add a timeout after 5 minutes
        setTimeout(() => {
          console.log('⏰ OAuth timeout after 5 minutes');
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          if (popup && !popup.closed) {
            popup.close();
          }
          setIsConnecting(false);
          reject(new Error('OAuth timeout after 5 minutes'));
        }, 300000);
      });
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