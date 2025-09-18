import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GmailCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Gmail callback triggered, current URL:', window.location.href);
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');
        
        console.log('URL params:', { code: code?.substring(0, 20) + '...', error, state });

        if (error) {
          console.error('OAuth error from Google:', error);
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          console.error('No authorization code in URL params');
          throw new Error('No authorization code received');
        }

        console.log('Received authorization code, exchanging for tokens...');

        // Exchange code for tokens via Edge Function
        const { data, error: exchangeError } = await supabase.functions.invoke('gmail-oauth-exchange', {
          body: { code, state }
        });

        if (exchangeError) {
          throw exchangeError;
        }

        if (data.success) {
          // Notify parent window of success
          if (window.opener) {
            window.opener.postMessage({
              type: 'GMAIL_OAUTH_SUCCESS',
              account: data.account
            }, window.location.origin);
          }
          window.close();
        } else {
          throw new Error(data.error || 'Token exchange failed');
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({
            type: 'GMAIL_OAUTH_ERROR',
            error: error.message
          }, window.location.origin);
        }
        
        // Don't close immediately on error, show error message
        setTimeout(() => {
          window.close();
        }, 3000);
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