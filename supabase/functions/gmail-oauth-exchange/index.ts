import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface UserInfo {
  email: string;
  name: string;
  picture?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, state } = await req.json();
    console.log('Exchanging authorization code for tokens...');

    if (!code) {
      throw new Error('Authorization code is required');
    }

    // Get Gmail client credentials from environment
    const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
    const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
    
    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
      throw new Error('Gmail OAuth credentials not configured');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        redirect_uri: `${new URL(req.url).origin}/gmail-callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokens: TokenResponse = await tokenResponse.json();
    console.log('Successfully received tokens');

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo: UserInfo = await userInfoResponse.json();
    console.log('Retrieved user info for:', userInfo.email);

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString();

    // Get current user (this should be handled differently in production)
    // For now, we'll need to pass the user ID from the frontend
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    // Create Supabase client with user context
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Failed to get current user');
    }

    // Store Gmail account in database
    const { data: account, error: insertError } = await supabase
      .from('gmail_accounts')
      .upsert({
        user_id: user.id,
        email_address: userInfo.email,
        display_name: userInfo.name,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokenExpiresAt,
        is_active: true,
        last_sync_at: null
      }, {
        onConflict: 'email_address',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to store Gmail account:', insertError);
      throw insertError;
    }

    console.log('Successfully stored Gmail account');

    return new Response(JSON.stringify({
      success: true,
      account: {
        id: account.id,
        email_address: account.email_address,
        display_name: account.display_name,
        is_active: account.is_active
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Gmail OAuth exchange error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});