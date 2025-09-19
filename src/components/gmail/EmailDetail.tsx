import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Star, 
  Archive, 
  Trash2, 
  MoreHorizontal,
  User,
  Calendar,
  Building,
  FileText
} from "lucide-react";
import { EmailCompose } from "./EmailCompose";

interface EmailDetailProps {
  isOpen: boolean;
  onClose: () => void;
  email: any;
  accounts: Array<{
    id: string;
    email_address: string;
    display_name?: string;
  }>;
  teddyConnections?: {
    staff?: Array<{ id: string; full_name: string; role?: string }>;
    contracts?: Array<{ id: string; employee_name: string; contract_type?: string }>;
    reviews?: Array<{ id: string; staff_id: string; review_date: string; score?: number }>;
  };
}

export const EmailDetail = ({ isOpen, onClose, email, accounts, teddyConnections }: EmailDetailProps) => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyMode, setReplyMode] = useState<'reply' | 'reply-all' | 'forward' | null>(null);

  if (!email) return null;

  const handleReply = () => {
    setReplyMode('reply');
    setIsComposeOpen(true);
  };

  const handleReplyAll = () => {
    setReplyMode('reply-all');
    setIsComposeOpen(true);
  };

  const handleForward = () => {
    setReplyMode('forward');
    setIsComposeOpen(true);
  };

  const getReplyData = () => {
    if (!replyMode) return undefined;

    switch (replyMode) {
      case 'reply':
        return {
          messageId: email.gmail_message_id,
          subject: email.subject,
          toEmail: email.sender_email,
          toName: email.sender_name
        };
      case 'reply-all':
        // Include all recipients except our own email
        const allRecipients = [
          email.sender_email,
          ...email.recipient_emails,
          ...email.cc_emails
        ].filter((emailAddr, index, arr) => 
          arr.indexOf(emailAddr) === index && // Remove duplicates
          !accounts.some(acc => acc.email_address === emailAddr) // Remove our own emails
        );
        
        return {
          messageId: email.gmail_message_id,
          subject: email.subject,
          toEmail: allRecipients.join(', '),
          toName: email.sender_name
        };
      case 'forward':
        return {
          messageId: email.gmail_message_id,
          subject: `Fwd: ${email.subject}`,
          toEmail: '',
          forwarded: true
        };
      default:
        return undefined;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl mb-2 leading-tight">
                  {email.subject}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{email.sender_name || email.sender_email}</span>
                  <Badge variant="outline" className="text-xs">
                    {email.gmail_account?.email_address}
                  </Badge>
                  <span>•</span>
                  <span>{formatDate(email.received_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex gap-4">
            {/* Main content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="pr-4">
                  {/* Email headers */}
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
                    </div>
                  </div>

                  {/* Email body */}
                  <div className="prose prose-sm max-w-none">
                    {email.body_html ? (
                      <div dangerouslySetInnerHTML={{ __html: email.body_html }} />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {email.body_text || email.snippet}
                      </pre>
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button onClick={handleReply} variant="outline" size="sm">
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                <Button onClick={handleReplyAll} variant="outline" size="sm">
                  <ReplyAll className="h-4 w-4 mr-1" />
                  Reply All
                </Button>
                <Button onClick={handleForward} variant="outline" size="sm">
                  <Forward className="h-4 w-4 mr-1" />
                  Forward
                </Button>
              </div>
            </div>

            {/* Teddy Kids Connections Sidebar */}
            {teddyConnections && (
              <div className="w-80 border-l pl-4">
                <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Teddy Kids Connections
                </h3>
                
                <div className="space-y-4">
                  {/* Staff connections */}
                  {teddyConnections.staff && teddyConnections.staff.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Staff Members
                      </h4>
                      <div className="space-y-2">
                        {teddyConnections.staff.map((staff) => (
                          <div key={staff.id} className="p-2 bg-muted/30 rounded-lg">
                            <div className="font-medium text-sm">{staff.full_name}</div>
                            {staff.role && (
                              <div className="text-xs text-muted-foreground">{staff.role}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contract connections */}
                  {teddyConnections.contracts && teddyConnections.contracts.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Related Contracts
                      </h4>
                      <div className="space-y-2">
                        {teddyConnections.contracts.map((contract) => (
                          <div key={contract.id} className="p-2 bg-muted/30 rounded-lg">
                            <div className="font-medium text-sm">{contract.employee_name}</div>
                            {contract.contract_type && (
                              <div className="text-xs text-muted-foreground">{contract.contract_type}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review connections */}
                  {teddyConnections.reviews && teddyConnections.reviews.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Related Reviews
                      </h4>
                      <div className="space-y-2">
                        {teddyConnections.reviews.map((review) => (
                          <div key={review.id} className="p-2 bg-muted/30 rounded-lg">
                            <div className="font-medium text-sm">
                              Review - {new Date(review.review_date).toLocaleDateString()}
                            </div>
                            {review.score && (
                              <div className="text-xs text-muted-foreground">Score: {review.score}/5</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No connections */}
                  {(!teddyConnections.staff || teddyConnections.staff.length === 0) &&
                   (!teddyConnections.contracts || teddyConnections.contracts.length === 0) &&
                   (!teddyConnections.reviews || teddyConnections.reviews.length === 0) && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No Teddy Kids connections found for this email.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Compose modal for replies */}
      <EmailCompose
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setReplyMode(null);
        }}
        accounts={accounts}
        replyTo={getReplyData()}
      />
    </>
  );
};