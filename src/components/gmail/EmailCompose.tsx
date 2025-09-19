import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Send, Paperclip, Type, Bold, Italic, Underline } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailComposeProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Array<{
    id: string;
    email_address: string;
    display_name?: string;
  }>;
  replyTo?: {
    messageId: string;
    subject: string;
    toEmail: string;
    toName?: string;
  };
}

export const EmailCompose = ({ isOpen, onClose, accounts, replyTo }: EmailComposeProps) => {
  const [fromAccount, setFromAccount] = useState<string>('');
  const [toEmail, setToEmail] = useState(replyTo?.toEmail || '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [bccEmail, setBccEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);

  const handleSendEmail = async () => {
    if (!fromAccount || !toEmail || !subject || !body) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    
    try {
      // Get the account details
      const selectedAccount = accounts.find(acc => acc.id === fromAccount);
      
      if (!selectedAccount) {
        throw new Error('Selected account not found');
      }

      // Get access token from the database
      const { data: accountData, error: accountError } = await supabase
        .from('gmail_accounts')
        .select('access_token')
        .eq('id', fromAccount)
        .single();

      if (accountError) throw accountError;

      // Call edge function to send email
      const { data, error } = await supabase.functions.invoke('gmail-integration', {
        body: {
          action: 'send_email',
          accountId: fromAccount,
          accessToken: accountData.access_token,
          emailData: {
            to: toEmail,
            cc: ccEmail,
            bcc: bccEmail,
            subject,
            body,
            fromEmail: selectedAccount.email_address,
            replyToMessageId: replyTo?.messageId
          }
        }
      });

      if (error) throw error;

      toast.success('Email sent successfully!');
      onClose();
      
      // Reset form
      setToEmail('');
      setSubject('');
      setBody('');
      setCcEmail('');
      setBccEmail('');
      setShowCC(false);
      setShowBCC(false);
      
    } catch (error: any) {
      toast.error(`Failed to send email: ${error.message}`);
      console.error('Send email error:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Set default account if none selected and we have accounts
  React.useEffect(() => {
    if (!fromAccount && accounts.length > 0) {
      setFromAccount(accounts[0].id);
    }
  }, [accounts, fromAccount]);

  // Update reply-to fields when replyTo changes
  React.useEffect(() => {
    if (replyTo) {
      setToEmail(replyTo.toEmail);
      setSubject(`Re: ${replyTo.subject.replace(/^Re:\s*/, '')}`);
    }
  }, [replyTo]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {replyTo ? 'Reply' : 'Compose Email'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* From Account Selector */}
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Select value={fromAccount} onValueChange={setFromAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex flex-col">
                      <span>{account.display_name || account.email_address}</span>
                      <span className="text-xs text-muted-foreground">{account.email_address}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Email */}
          <div className="space-y-2">
            <Label htmlFor="to">To *</Label>
            <Input
              id="to"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="recipient@example.com"
              required
            />
          </div>

          {/* CC/BCC Toggle */}
          <div className="flex gap-2">
            {!showCC && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCC(true)}
                className="text-xs"
              >
                + CC
              </Button>
            )}
            {!showBCC && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBCC(true)}
                className="text-xs"
              >
                + BCC
              </Button>
            )}
          </div>

          {/* CC Email */}
          {showCC && (
            <div className="space-y-2">
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                type="email"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="cc@example.com"
              />
            </div>
          )}

          {/* BCC Email */}
          {showBCC && (
            <div className="space-y-2">
              <Label htmlFor="bcc">BCC</Label>
              <Input
                id="bcc"
                type="email"
                value={bccEmail}
                onChange={(e) => setBccEmail(e.target.value)}
                placeholder="bcc@example.com"
              />
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
            />
          </div>

          <Separator />

          {/* Email Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <div className="border rounded-lg">
              {/* Simple toolbar */}
              <div className="flex items-center gap-1 p-2 border-b bg-muted/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here..."
                className="min-h-[200px] border-0 focus:ring-0 resize-none"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Attach files
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={isSending}>
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};