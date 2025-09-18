-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Gmail accounts table
CREATE TABLE public.gmail_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  display_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email_address)
);

-- Create emails table
CREATE TABLE public.emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gmail_account_id UUID REFERENCES public.gmail_accounts(id) ON DELETE CASCADE NOT NULL,
  gmail_message_id TEXT NOT NULL,
  gmail_thread_id TEXT NOT NULL,
  subject TEXT,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  recipient_emails TEXT[] NOT NULL DEFAULT '{}',
  cc_emails TEXT[] NOT NULL DEFAULT '{}',
  bcc_emails TEXT[] NOT NULL DEFAULT '{}',
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  has_attachments BOOLEAN NOT NULL DEFAULT false,
  attachment_count INTEGER NOT NULL DEFAULT 0,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(gmail_account_id, gmail_message_id)
);

-- Create email labels table for custom TeddyMail labels
CREATE TABLE public.email_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

-- Create email label assignments table
CREATE TABLE public.email_label_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID REFERENCES public.emails(id) ON DELETE CASCADE NOT NULL,
  label_id UUID REFERENCES public.email_labels(id) ON DELETE CASCADE NOT NULL,
  assigned_by_ai BOOLEAN NOT NULL DEFAULT false,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email_id, label_id)
);

-- Enable Row Level Security
ALTER TABLE public.gmail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_label_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gmail_accounts
CREATE POLICY "Users can view their own gmail accounts" 
ON public.gmail_accounts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gmail accounts" 
ON public.gmail_accounts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gmail accounts" 
ON public.gmail_accounts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gmail accounts" 
ON public.gmail_accounts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for emails
CREATE POLICY "Users can view emails from their accounts" 
ON public.emails FOR SELECT 
USING (
  gmail_account_id IN (
    SELECT id FROM public.gmail_accounts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert emails for their accounts" 
ON public.emails FOR INSERT 
WITH CHECK (
  gmail_account_id IN (
    SELECT id FROM public.gmail_accounts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update emails from their accounts" 
ON public.emails FOR UPDATE 
USING (
  gmail_account_id IN (
    SELECT id FROM public.gmail_accounts WHERE user_id = auth.uid()
  )
);

-- RLS Policies for email_labels (shared across all users for now)
CREATE POLICY "Anyone can view email labels" 
ON public.email_labels FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create email labels" 
ON public.email_labels FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update email labels" 
ON public.email_labels FOR UPDATE 
USING (true);

-- RLS Policies for email_label_assignments
CREATE POLICY "Users can view label assignments for their emails" 
ON public.email_label_assignments FOR SELECT 
USING (
  email_id IN (
    SELECT e.id FROM public.emails e
    JOIN public.gmail_accounts ga ON e.gmail_account_id = ga.id
    WHERE ga.user_id = auth.uid()
  )
);

CREATE POLICY "Users can assign labels to their emails" 
ON public.email_label_assignments FOR INSERT 
WITH CHECK (
  email_id IN (
    SELECT e.id FROM public.emails e
    JOIN public.gmail_accounts ga ON e.gmail_account_id = ga.id
    WHERE ga.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update label assignments for their emails" 
ON public.email_label_assignments FOR UPDATE 
USING (
  email_id IN (
    SELECT e.id FROM public.emails e
    JOIN public.gmail_accounts ga ON e.gmail_account_id = ga.id
    WHERE ga.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_emails_gmail_account_id ON public.emails(gmail_account_id);
CREATE INDEX idx_emails_received_at ON public.emails(received_at DESC);
CREATE INDEX idx_emails_is_read ON public.emails(is_read);
CREATE INDEX idx_emails_is_archived ON public.emails(is_archived);
CREATE INDEX idx_emails_sender_email ON public.emails(sender_email);
CREATE INDEX idx_email_label_assignments_email_id ON public.email_label_assignments(email_id);
CREATE INDEX idx_email_label_assignments_label_id ON public.email_label_assignments(label_id);

-- Insert default system labels
INSERT INTO public.email_labels (name, color, description, is_system) VALUES
('Invoices - To Pay', '#EF4444', 'Invoices that need to be paid', true),
('Invoices - Paid', '#10B981', 'Invoices that have been paid', true),
('Child Registration', '#8B5CF6', 'Child sign-ups and parent communications', true),
('Staff Registration', '#3B82F6', 'Staff and intern registrations', true),
('Government & GGD', '#F59E0B', 'Government correspondence and GGD communications', true),
('Urgent / Legal', '#DC2626', 'Urgent matters and legal documents', true),
('Documents & Attachments', '#6B7280', 'Important documents and file attachments', true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_gmail_accounts_updated_at
  BEFORE UPDATE ON public.gmail_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emails_updated_at
  BEFORE UPDATE ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_labels_updated_at
  BEFORE UPDATE ON public.email_labels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();