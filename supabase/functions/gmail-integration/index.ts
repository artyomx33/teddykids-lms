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

    // Build query for incremental sync
    let gmailQuery = 'is:unread';
    if (account.last_sync_at) {
      const lastSyncDate = new Date(account.last_sync_at);
      const formattedDate = lastSyncDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      gmailQuery = `newer_than:${formattedDate}`;
    }

    console.log(`Syncing emails with query: ${gmailQuery}`);

    // Fetch messages from Gmail API with pagination
    let allMessages: Array<{ id: string; threadId: string }> = [];
    let nextPageToken: string | undefined;
    const BATCH_SIZE = 50;
    
    do {
      const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
      url.searchParams.set('maxResults', BATCH_SIZE.toString());
      url.searchParams.set('q', gmailQuery);
      if (nextPageToken) {
        url.searchParams.set('pageToken', nextPageToken);
      }

      const messagesResponse = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!messagesResponse.ok) {
        throw new Error(`Gmail API error: ${messagesResponse.status}`);
      }

      const messagesData: GmailMessagesResponse = await messagesResponse.json();
      
      if (messagesData.messages) {
        allMessages.push(...messagesData.messages);
      }
      
      nextPageToken = messagesData.nextPageToken;
      
      // Limit total messages to avoid timeouts (process up to 200 messages per sync)
      if (allMessages.length >= 200) {
        console.log(`Limiting sync to first 200 messages`);
        allMessages = allMessages.slice(0, 200);
        break;
      }
      
    } while (nextPageToken);

    console.log(`Found ${allMessages.length} total messages to process`);

    if (allMessages.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No new messages found',
        count: 0,
        processed: 0,
        total: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process emails in batches to avoid timeout
    const MESSAGE_BATCH_SIZE = 10;
    let totalProcessed = 0;
    const totalToProcess = Math.min(allMessages.length, 100); // Process max 100 emails per sync
    
    for (let i = 0; i < totalToProcess; i += MESSAGE_BATCH_SIZE) {
      const batch = allMessages.slice(i, i + MESSAGE_BATCH_SIZE);
      const emailsToInsert = [];
      
      console.log(`Processing batch ${Math.floor(i/MESSAGE_BATCH_SIZE) + 1}: messages ${i + 1} to ${Math.min(i + MESSAGE_BATCH_SIZE, totalToProcess)}`);
      
      // Fetch full message details for this batch
      for (const message of batch) {
        try {
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
        } catch (messageError) {
          console.error(`Error processing message ${message.id}:`, messageError);
          // Continue processing other messages
        }
      }

      // Insert batch into database
      if (emailsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('emails')
          .upsert(emailsToInsert, { 
            onConflict: 'gmail_account_id,gmail_message_id',
            ignoreDuplicates: true 
          });

        if (insertError) {
          console.error('Error inserting batch:', insertError);
          // Continue with next batch instead of failing completely
        } else {
          totalProcessed += emailsToInsert.length;
        }
      }
      
      // Small delay between batches to be nice to the API
      if (i + MESSAGE_BATCH_SIZE < totalToProcess) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Update last sync time
    await supabase
      .from('gmail_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Synced ${totalProcessed} emails`,
      count: totalProcessed,
      processed: totalProcessed,
      total: allMessages.length,
      incremental: !!account.last_sync_at 
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