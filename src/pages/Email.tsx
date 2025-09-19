import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Mail, Filter, Settings, Star, Archive, Send, Trash2, MessageSquare } from "lucide-react";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { useEmailRealtime } from "@/hooks/useEmailRealtime";
import { useDrafts } from "@/hooks/useDrafts";
import { ConnectGmailButton } from "@/components/gmail/ConnectGmailButton";
import { GmailAccountCard } from "@/components/gmail/GmailAccountCard";
import { EmailCompose } from "@/components/gmail/EmailCompose";
import { EmailDetail } from "@/components/gmail/EmailDetail";
import { EmailThreadView } from "@/components/gmail/EmailThreadView";
import { EmailSearch } from "@/components/gmail/EmailSearch";
import { EmailActions, useEmailActions } from "@/components/gmail/EmailActions";
import { AccountSwitcher } from "@/components/gmail/AccountSwitcher";
import { EmailLabels } from "@/components/gmail/EmailLabels";
import { useEmailTeddyConnections } from "@/hooks/useEmailTeddyConnections";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Email = () => {
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [emails, setEmails] = useState<any[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<any[]>([]);
  const [emailLabels, setEmailLabels] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isEmailDetailOpen, setIsEmailDetailOpen] = useState(false);
  const [isThreadViewOpen, setIsThreadViewOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'thread'>('list');
  const [replyMode, setReplyMode] = useState<'reply' | 'reply-all' | 'forward' | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  const { 
    accounts, 
    isConnecting, 
    isLoading, 
    connectGmailAccount, 
    disconnectAccount, 
    syncAccount, 
    fetchAccounts 
  } = useGmailAuth();
  
  const { connections: teddyConnections } = useEmailTeddyConnections(selectedEmail);
  const { drafts } = useDrafts();
  const { starEmail, archiveEmail, trashEmail } = useEmailActions();
  
  // Real-time updates
  const { isConnected: realtimeConnected } = useEmailRealtime(() => {
    fetchEmails();
  });

  useEffect(() => {
    fetchAccounts();
    fetchEmailLabels();
    
    // Check for OAuth errors from localStorage
    const oauthError = localStorage.getItem('gmail_oauth_error');
    if (oauthError) {
      toast.error(`Gmail connection failed: ${oauthError}`);
      localStorage.removeItem('gmail_oauth_error');
    }
  }, [fetchAccounts]);

  const fetchEmailLabels = async () => {
    try {
      const { data, error } = await supabase
        .from('email_labels')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setEmailLabels(data || []);
    } catch (error) {
      console.error('Error fetching email labels:', error);
    }
  };

  const fetchEmails = async () => {
    try {
      let query = supabase
        .from('emails')
        .select(`
          *,
          gmail_account:gmail_accounts(email_address, display_name),
          email_label_assignments(
            email_labels(name, color)
          )
        `);

      // Filter by selected account if one is chosen
      if (selectedAccountId) {
        query = query.eq('gmail_account_id', selectedAccountId);
      }

      // Filter by tab
      switch (selectedTab) {
        case 'sent':
          query = query.eq('email_type', 'sent');
          break;
        case 'starred':
          query = query.eq('is_starred', true).eq('is_trashed', false);
          break;
        case 'archived':
          query = query.eq('is_archived', true).eq('is_trashed', false);
          break;
        case 'trash':
          query = query.eq('is_trashed', true);
          break;
        default: // inbox
          query = query.eq('email_type', 'received').eq('is_archived', false).eq('is_trashed', false);
          break;
      }

      const { data, error } = await query
        .order('received_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setEmails(data || []);
      
      // Update filtered emails if not searching
      if (!isSearchActive) {
        setFilteredEmails(data || []);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const handleSyncAccount = async (accountId: string, onProgress?: (progress: { processed: number, total: number, message: string }) => void) => {
    const result = await syncAccount(accountId, onProgress);
    await fetchEmails();
    return result;
  };

  const handleEmailClick = (email: any, forceDetailView = false) => {
    // Clear selection when clicking on an email
    setSelectedEmails([]);
    
    // Check if this email is part of a thread (has other emails with same thread_id)
    const threadEmails = emails.filter(e => e.gmail_thread_id === email.gmail_thread_id);
    
    if (threadEmails.length > 1 && !forceDetailView) {
      // Show thread view
      setSelectedThreadId(email.gmail_thread_id);
      setIsThreadViewOpen(true);
    } else {
      // Show single email detail
      setSelectedEmail(email);
      setIsEmailDetailOpen(true);
    }
    
    // Mark as read
    if (!email.is_read) {
      supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', email.id)
        .then(() => fetchEmails());
    }
  };

  const handleThreadReply = (email: any, mode: 'reply' | 'reply-all' | 'forward') => {
    setSelectedEmail(email);
    setReplyMode(mode);
    setIsComposeOpen(true);
  };

  const handleSearch = (searchResults: any[]) => {
    setFilteredEmails(searchResults);
    setIsSearchActive(true);
  };

  const handleClearSearch = () => {
    setFilteredEmails(emails);
    setIsSearchActive(false);
  };

  const handleSelectEmail = (emailId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(filteredEmails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedEmails([]);
  };

  useEffect(() => {
    if (accounts.length > 0) {
      fetchEmails();
    }
  }, [accounts, selectedAccountId, selectedTab]);

  const getEmailCounts = () => {
    const counts = {
      inbox: 0,
      sent: 0,
      starred: 0,
      archived: 0,
      trash: 0,
      drafts: drafts.length
    };

    emails.forEach(email => {
      if (email.email_type === 'sent') {
        counts.sent++;
      } else if (email.is_trashed) {
        counts.trash++;
      } else if (email.is_archived) {
        counts.archived++;
      } else {
        counts.inbox++;
      }
      
      if (email.is_starred && !email.is_trashed) {
        counts.starred++;
      }
    });

    return counts;
  };

  const emailCounts = getEmailCounts();

  const navigationItems = [
    { 
      id: 'inbox', 
      name: 'Inbox', 
      icon: Mail, 
      count: emailCounts.inbox
    },
    { id: 'sent', name: 'Sent', icon: Send, count: emailCounts.sent },
    { id: 'starred', name: 'Starred', icon: Star, count: emailCounts.starred },
    { id: 'archived', name: 'Archived', icon: Archive, count: emailCounts.archived },
    { id: 'trash', name: 'Trash', icon: Trash2, count: emailCounts.trash },
    { id: 'drafts', name: 'Drafts', icon: MessageSquare, count: emailCounts.drafts }
  ];

  const getTabTitle = () => {
    const baseTitle = selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1);
    if (isSearchActive) {
      return `Search Results`;
    }
    return baseTitle;
  };

  // Show connect screen if no accounts
  if (accounts.length === 0 && !isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to TeddyMail</CardTitle>
              <p className="text-muted-foreground">
                Connect your Gmail accounts to get started with your unified inbox
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConnectGmailButton 
                onConnect={connectGmailAccount}
                isConnecting={isConnecting}
                variant="ghost"
                size="sm"
              />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Coming soon:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Smart AI categorization</li>
                  <li>• Automatic invoice tracking</li>
                  <li>• Staff & child registration management</li>
                  <li>• GGD & government correspondence</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border/50 bg-card">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            TeddyMail
          </h1>
          
          {/* Connected Accounts */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Connected Accounts</h3>
              <ConnectGmailButton 
                onConnect={connectGmailAccount}
                isConnecting={isConnecting}
              />
            </div>
            <div className="space-y-2">
              {accounts.map((account) => (
                <GmailAccountCard
                  key={account.id}
                  account={account}
                  onDisconnect={disconnectAccount}
                  onSync={handleSyncAccount}
                />
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Navigation */}
          <nav className="space-y-1 mb-6">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-accent transition-colors ${
                  selectedTab === item.id ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {item.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          <Separator className="mb-6" />

          {/* Account Filter */}
          <div className="mb-6">
            <AccountSwitcher
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onAccountChange={setSelectedAccountId}
            />
          </div>

          <Separator className="mb-6" />

          {/* TeddyMail Labels */}
          <EmailLabels 
            labels={emailLabels} 
            onRefresh={fetchEmailLabels}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">{getTabTitle()}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
              <Button size="sm" onClick={() => setIsComposeOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Compose
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="w-full max-w-2xl">
            <EmailSearch
              accounts={accounts}
              onSearch={handleSearch}
              onClearSearch={handleClearSearch}
            />
          </div>
        </div>

        {/* Email Actions */}
        {filteredEmails.length > 0 && (
          <div className="px-4 py-2 border-b border-border/50">
            <EmailActions
              selectedEmails={selectedEmails}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onRefresh={fetchEmails}
              allSelected={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
              someSelected={selectedEmails.length > 0 && selectedEmails.length < filteredEmails.length}
            />
          </div>
        )}

        {/* Email List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {filteredEmails.length > 0 ? filteredEmails.map((email) => {
                const threadEmails = emails.filter(e => e.gmail_thread_id === email.gmail_thread_id);
                const isThread = threadEmails.length > 1;
                
                return (
                  <Card key={email.id} className={`transition-colors hover:bg-accent/50 ${!email.is_read ? 'border-l-4 border-l-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedEmails.includes(email.id)}
                          onCheckedChange={(checked) => handleSelectEmail(email.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleEmailClick(email)}
                        >
                          <div className="flex items-start justify-between mb-2">
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
                                {isThread && (
                                  <Badge variant="outline" className="text-xs">
                                    📧 {threadEmails.length}
                                  </Badge>
                                )}
                                {realtimeConnected && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Real-time connected" />
                                )}
                              </div>
                              <h4 className={`text-sm mb-1 ${!email.is_read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                {email.subject}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {email.snippet}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {email.has_attachments && (
                                <Badge variant="outline" className="text-xs">
                                  📎 {email.attachment_count}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(email.received_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {email.email_label_assignments?.map((assignment: any, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <div 
                                  className="w-2 h-2 rounded-full mr-1" 
                                  style={{ backgroundColor: assignment.email_labels.color }}
                                ></div>
                                {assignment.email_labels.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Quick actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              starEmail(email.id, email.is_starred).then(() => fetchEmails());
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveEmail(email.id, email.is_archived).then(() => fetchEmails());
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-12">
                  {selectedTab === 'drafts' ? (
                    <>
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No drafts yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Start composing an email to create a draft
                      </p>
                    </>
                  ) : isSearchActive ? (
                    <>
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No emails found</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Try adjusting your search terms
                      </p>
                    </>
                  ) : (
                    <>
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No emails in {selectedTab}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Try syncing your connected accounts to load emails
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Email Compose Modal */}
      <EmailCompose
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setReplyMode(null);
        }}
        accounts={accounts}
        replyTo={replyMode && selectedEmail ? {
          messageId: selectedEmail.gmail_message_id,
          subject: selectedEmail.subject,
          toEmail: selectedEmail.sender_email,
          toName: selectedEmail.sender_name
        } : undefined}
      />

      {/* Email Detail Modal */}
      <EmailDetail
        isOpen={isEmailDetailOpen}
        onClose={() => {
          setIsEmailDetailOpen(false);
          setSelectedEmail(null);
        }}
        email={selectedEmail}
        accounts={accounts}
        teddyConnections={teddyConnections}
      />

      {/* Thread View Modal */}
      {selectedThreadId && (
        <EmailThreadView
          threadId={selectedThreadId}
          accounts={accounts}
          onReply={handleThreadReply}
        />
      )}
    </div>
  );
};

export default Email;