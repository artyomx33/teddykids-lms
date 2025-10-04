-- Add email_type column to track sent/received/draft emails
ALTER TABLE emails ADD COLUMN email_type text DEFAULT 'received' CHECK (email_type IN ('received', 'sent', 'draft'));

-- Add email status sync columns
ALTER TABLE emails ADD COLUMN gmail_label_ids text[] DEFAULT '{}';
ALTER TABLE emails ADD COLUMN is_important boolean DEFAULT false;
ALTER TABLE emails ADD COLUMN is_trashed boolean DEFAULT false;

-- Add attachment support
ALTER TABLE emails ADD COLUMN attachments jsonb DEFAULT '[]';

-- Create drafts table for email composition
CREATE TABLE email_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_account_id uuid NOT NULL REFERENCES gmail_accounts(id) ON DELETE CASCADE,
  to_emails text[] NOT NULL DEFAULT '{}',
  cc_emails text[] NOT NULL DEFAULT '{}',
  bcc_emails text[] NOT NULL DEFAULT '{}',
  subject text DEFAULT '',
  body text DEFAULT '',
  reply_to_message_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on drafts
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

-- RLS policies for drafts
CREATE POLICY "Users can manage their own email drafts" ON email_drafts
FOR ALL USING (
  gmail_account_id IN (
    SELECT id FROM gmail_accounts WHERE user_id = auth.uid()
  )
);

-- Add indexes for better performance
CREATE INDEX idx_emails_gmail_thread_id ON emails(gmail_thread_id);
CREATE INDEX idx_emails_type ON emails(email_type);
CREATE INDEX idx_emails_sender_email ON emails(sender_email);
CREATE INDEX idx_emails_subject_search ON emails USING gin(to_tsvector('english', subject));
CREATE INDEX idx_emails_body_search ON emails USING gin(to_tsvector('english', coalesce(body_text, '')));

-- Enable real-time for emails
ALTER TABLE emails REPLICA IDENTITY FULL;
ALTER TABLE email_drafts REPLICA IDENTITY FULL;

-- Add real-time publication
ALTER publication supabase_realtime ADD TABLE emails;
ALTER publication supabase_realtime ADD TABLE email_drafts;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for drafts updated_at
CREATE TRIGGER email_drafts_updated_at
  BEFORE UPDATE ON email_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_email_drafts_updated_at();