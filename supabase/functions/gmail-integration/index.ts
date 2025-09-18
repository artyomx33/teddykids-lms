import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GmailMessage {
  id: string;
  threadId: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ body?: { data?: string }; mimeType: string }>;
  };
  snippet: string;
  internalDate: string;
}

interface GmailMessagesResponse {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
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
    const { action, accountId, accessToken } = await req.json();
    console.log(`Gmail Integration: ${action} for account ${accountId}`);

    switch (action) {
      case 'sync_emails':
        return await syncEmails(accountId, accessToken);
      case 'send_email':
        return await sendEmail(await req.json());
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in gmail-integration function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function syncEmails(accountId: string, accessToken: string) {
  try {
    // Get Gmail account info
    const { data: account, error: accountError } = await supabase
      .from('gmail_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError) throw accountError;

    // Fetch messages from Gmail API
    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=is:unread`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!messagesResponse.ok) {
      throw new Error(`Gmail API error: ${messagesResponse.status}`);
    }

    const messagesData: GmailMessagesResponse = await messagesResponse.json();
    console.log(`Found ${messagesData.messages?.length || 0} messages`);

    if (!messagesData.messages || messagesData.messages.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No new messages found',
        count: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch full message details
    const emailsToInsert = [];
    
    for (const message of messagesData.messages.slice(0, 10)) { // Limit to 10 for now
      const messageResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (messageResponse.ok) {
        const messageData: GmailMessage = await messageResponse.json();
        const emailData = parseGmailMessage(messageData, accountId);
        emailsToInsert.push(emailData);
      }
    }

    // Insert emails into database
    if (emailsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('emails')
        .upsert(emailsToInsert, { 
          onConflict: 'gmail_account_id,gmail_message_id',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Error inserting emails:', insertError);
        throw insertError;
      }
    }

    // Update last sync time
    await supabase
      .from('gmail_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Synced ${emailsToInsert.length} emails`,
      count: emailsToInsert.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error syncing emails:', error);
    throw error;
  }
}

function parseGmailMessage(message: GmailMessage, accountId: string) {
  const headers = message.payload.headers;
  const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  // Extract email body
  let bodyText = '';
  let bodyHtml = '';
  
  if (message.payload.body?.data) {
    bodyText = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  } else if (message.payload.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        bodyText = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        bodyHtml = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
    }
  }

  // Parse recipient emails
  const toHeader = getHeader('To');
  const ccHeader = getHeader('Cc');
  const bccHeader = getHeader('Bcc');
  
  const parseEmails = (header: string) => {
    if (!header) return [];
    return header.split(',').map(email => email.trim().replace(/.*<(.+)>.*/, '$1'));
  };

  return {
    gmail_account_id: accountId,
    gmail_message_id: message.id,
    gmail_thread_id: message.threadId,
    subject: getHeader('Subject') || '(No Subject)',
    sender_email: getHeader('From').replace(/.*<(.+)>.*/, '$1') || getHeader('From'),
    sender_name: getHeader('From').replace(/<.*>/, '').trim() || null,
    recipient_emails: parseEmails(toHeader),
    cc_emails: parseEmails(ccHeader),
    bcc_emails: parseEmails(bccHeader),
    body_text: bodyText || null,
    body_html: bodyHtml || null,
    snippet: message.snippet || '',
    received_at: new Date(parseInt(message.internalDate)).toISOString(),
    has_attachments: false, // TODO: Implement attachment detection
    attachment_count: 0
  };
}

async function sendEmail(emailData: any) {
  // TODO: Implement email sending
  return new Response(JSON.stringify({ 
    success: false, 
    message: 'Email sending not implemented yet' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}