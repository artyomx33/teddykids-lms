import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GmailCallback = () => {
  console.log('🎯 GmailCallback component mounted!');
  console.log('📍 Current URL on mount:', window.location.href);
  
  useEffect(() => {
    console.log('🔄 useEffect triggered in GmailCallback');
    const handleCallback = async () => {
      try {
        console.log('🎯 Gmail callback page loaded!');
        console.log('📍 Current URL:', window.location.href);
        console.log('🔍 Window opener exists:', !!window.opener);
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');
        
        console.log('📋 URL params extracted:', { 
          code: code ? code.substring(0, 20) + '...' : null, 
          error, 
          state 
        });

        if (error) {
          console.error('❌ OAuth error from Google:', error);
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          console.error('❌ No authorization code in URL params');
          console.log('🔍 All URL params:', Object.fromEntries(urlParams.entries()));
          throw new Error('No authorization code received');
        }

        console.log('🔄 Exchanging authorization code for tokens...');
        console.log('📡 Calling gmail-oauth-exchange edge function...');

        // Exchange code for tokens via Edge Function
        const { data, error: exchangeError } = await supabase.functions.invoke('gmail-oauth-exchange', {
          body: { code, state }
        });

        console.log('📥 Edge function response:', { data, exchangeError });

        if (exchangeError) {
          console.error('❌ Exchange error:', exchangeError);
          throw exchangeError;
        }

        if (data?.success) {
          console.log('✅ Token exchange successful!', data.account);
          
          // Check if this is a redirect flow vs popup flow
          const isRedirectFlow = state?.startsWith('redirect_');
          
          if (isRedirectFlow) {
            console.log('🔄 Redirect flow detected, redirecting back to app...');
            // Get the return URL or default to email page
            const returnUrl = localStorage.getItem('gmail_oauth_return_url') || '/email';
            localStorage.removeItem('gmail_oauth_return_url');
            window.location.href = returnUrl;
          } else {
            // Popup flow
            if (window.opener) {
              console.log('📨 Sending success message to parent window...');
              window.opener.postMessage({
                type: 'GMAIL_OAUTH_SUCCESS',
                account: data.account
              }, window.location.origin);
              console.log('✅ Success message sent to parent');
            } else {
              console.warn('⚠️ No parent window found to notify');
            }
            
            console.log('🪟 Closing popup window...');
            setTimeout(() => window.close(), 1000);
          }
        } else {
          console.error('❌ Token exchange failed:', data);
          throw new Error(data?.error || 'Token exchange failed');
        }
      } catch (error: any) {
        console.error('💥 OAuth callback error:', error);
        
        // Re-extract state to check flow type
        const urlParams = new URLSearchParams(window.location.search);
        const state = urlParams.get('state');
        const isRedirectFlow = state?.startsWith('redirect_');
        
        if (isRedirectFlow) {
          // For redirect flow, show error on the page
          console.log('🔄 Redirect flow error, staying on callback page to show error');
          // The error will be shown in the UI below
        } else {
          // For popup flow, notify parent window
          if (window.opener) {
            console.log('📨 Sending error message to parent window...');
            window.opener.postMessage({
              type: 'GMAIL_OAUTH_ERROR',
              error: error.message
            }, window.location.origin);
            console.log('❌ Error message sent to parent');
          } else {
            console.warn('⚠️ No parent window found to notify of error');
          }
          
          // Don't close immediately on error, show error message
          console.log('⏰ Closing popup in 3 seconds...');
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      }
    };

    handleCallback();
  }, []);

  console.log('🎨 Rendering GmailCallback component');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Connecting Gmail Account
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Please wait while we connect your Gmail account...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GmailCallback;