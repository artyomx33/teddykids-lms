import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GmailCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for tokens via Edge Function
        const { data, error: exchangeError } = await supabase.functions.invoke('gmail-oauth-exchange', {
          body: { code, state }
        });

        if (exchangeError) {
          throw exchangeError;
        }

        if (data?.success) {
          // Check if this is a redirect flow vs popup flow
          const isRedirectFlow = state?.startsWith('redirect_');
          
          if (isRedirectFlow) {
            // Get the return URL or default to email page
            const returnUrl = localStorage.getItem('gmail_oauth_return_url') || '/email';
            localStorage.removeItem('gmail_oauth_return_url');
            window.location.href = returnUrl;
          } else {
            // Popup flow
            if (window.opener) {
              window.opener.postMessage({
                type: 'GMAIL_OAUTH_SUCCESS',
                account: data.account
              }, window.location.origin);
            }
            setTimeout(() => window.close(), 1000);
          }
        } else {
          throw new Error(data?.error || 'Token exchange failed');
        }
      } catch (error: any) {
        console.error('Gmail OAuth callback error:', error);
        
        // Re-extract state to check flow type
        const urlParams = new URLSearchParams(window.location.search);
        const state = urlParams.get('state');
        const isRedirectFlow = state?.startsWith('redirect_');
        
        if (isRedirectFlow) {
          // For redirect flow, redirect back to email page with error
          const returnUrl = localStorage.getItem('gmail_oauth_return_url') || '/email';
          localStorage.removeItem('gmail_oauth_return_url');
          localStorage.setItem('gmail_oauth_error', error.message);
          window.location.href = returnUrl;
        } else {
          // For popup flow, notify parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'GMAIL_OAUTH_ERROR',
              error: error.message
            }, window.location.origin);
          }
          setTimeout(() => window.close(), 3000);
        }
      }
    };

    handleCallback();
  }, []);

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