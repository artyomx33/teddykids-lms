import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Reply, ReplyAll, Forward } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EmailThreadViewProps {
  threadId: string;
  accounts: Array<{
    id: string;
    email_address: string;
    display_name?: string;
  }>;
  onReply?: (email: any, mode: 'reply' | 'reply-all' | 'forward') => void;
}

export const EmailThreadView = ({ threadId, accounts, onReply }: EmailThreadViewProps) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchThreadEmails();
  }, [threadId]);

  const fetchThreadEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          gmail_account:gmail_accounts(email_address, display_name)
        `)
        .eq('gmail_thread_id', threadId)
        .order('received_at', { ascending: true });

      if (error) throw error;
      
      setEmails(data || []);
      
      // Expand the last email by default
      if (data && data.length > 0) {
        setExpandedEmails(new Set([data[data.length - 1].id]));
      }
    } catch (error) {
      console.error('Error fetching thread emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (emailId: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId);
    } else {
      newExpanded.add(emailId);
    }
    setExpandedEmails(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading thread...</div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No emails found in this thread</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.map((email, index) => {
        const isExpanded = expandedEmails.has(email.id);
        const isLast = index === emails.length - 1;
        
        return (
          <Card key={email.id} className={`transition-all ${!email.is_read ? 'border-l-4 border-l-primary' : ''}`}>
            <CardContent className="p-0">
              {/* Email header - always visible */}
              <div 
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleExpanded(email.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm ${!email.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {email.sender_name || email.sender_email}
                      </span>
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {email.gmail_account?.email_address}
                      </Badge>
                      {email.email_type === 'sent' && (
                        <Badge variant="secondary" className="text-xs">
                          Sent
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(email.received_at)}
                      </span>
                      {!isExpanded && (
                        <span className="text-xs text-muted-foreground truncate">
                          {email.snippet}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {email.has_attachments && (
                      <Badge variant="outline" className="text-xs">
                        📎 {email.attachment_count}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Email content - shown when expanded */}
              {isExpanded && (
                <>
                  <Separator />
                  <div className="p-4">
                    {/* Email details */}
                    <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">From:</span> {email.sender_name ? `${email.sender_name} <${email.sender_email}>` : email.sender_email}
                        </div>
                        <div>
                          <span className="font-medium">To:</span> {email.recipient_emails.join(', ')}
                        </div>
                        {email.cc_emails.length > 0 && (
                          <div>
                            <span className="font-medium">CC:</span> {email.cc_emails.join(', ')}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Date:</span> {new Date(email.received_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Email body */}
                    <ScrollArea className="max-h-96">
                      <div className="prose prose-sm max-w-none">
                        {email.body_html ? (
                          <div dangerouslySetInnerHTML={{ __html: email.body_html }} />
                        ) : (
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {email.body_text || email.snippet}
                          </pre>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Attachments */}
                    {email.has_attachments && email.attachments && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">Attachments:</h5>
                        <div className="space-y-2">
                          {email.attachments.map((attachment: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                              <span className="text-sm font-mono">📎</span>
                              <span className="text-sm">{attachment.filename}</span>
                              <Badge variant="outline" className="text-xs ml-auto">
                                {Math.round(attachment.size / 1024)}KB
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onReply?.(email, 'reply')}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onReply?.(email, 'reply-all')}
                      >
                        <ReplyAll className="h-4 w-4 mr-1" />
                        Reply All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onReply?.(email, 'forward')}
                      >
                        <Forward className="h-4 w-4 mr-1" />
                        Forward
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};