import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Mail, Search, Filter, Settings, Star, Archive, Send, Trash2 } from "lucide-react";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { ConnectGmailButton } from "@/components/gmail/ConnectGmailButton";
import { GmailAccountCard } from "@/components/gmail/GmailAccountCard";
import { EmailCompose } from "@/components/gmail/EmailCompose";
import { EmailDetail } from "@/components/gmail/EmailDetail";
import { AccountSwitcher } from "@/components/gmail/AccountSwitcher";
import { EmailLabels } from "@/components/gmail/EmailLabels";
import { useEmailTeddyConnections } from "@/hooks/useEmailTeddyConnections";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Email = () => {
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [emails, setEmails] = useState<any[]>([]);
  const [emailLabels, setEmailLabels] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isEmailDetailOpen, setIsEmailDetailOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
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

      const { data, error } = await query
        .order('received_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const handleSyncAccount = async (accountId: string, onProgress?: (progress: { processed: number, total: number, message: string }) => void) => {
    const result = await syncAccount(accountId, onProgress);
    await fetchEmails();
    return result;
  };

  const handleEmailClick = (email: any) => {
    setSelectedEmail(email);
    setIsEmailDetailOpen(true);
    
    // Mark as read
    if (!email.is_read) {
      supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', email.id)
        .then(() => fetchEmails());
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      fetchEmails();
    }
  }, [accounts, selectedAccountId]);

  const navigationItems = [
    { 
      id: 'inbox', 
      name: 'All Mail', 
      icon: Mail, 
      count: selectedAccountId 
        ? emails.length 
        : emails.length
    },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'starred', name: 'Starred', icon: Star, count: 0 },
    { id: 'archived', name: 'Archived', icon: Archive, count: 0 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 0 }
  ];

  const getTabTitle = () => {
    switch (selectedTab) {
      case 'inbox': return 'All Mail';
      case 'sent': return 'Sent';
      case 'starred': return 'Starred';
      case 'archived': return 'Archived';
      case 'trash': return 'Trash';
      default: return 'All Mail';
    }
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
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {selectedTab === 'inbox' && emails.length > 0 && emails.map((email) => (
                <Card key={email.id} className={`cursor-pointer transition-colors hover:bg-accent/50 ${!email.is_read ? 'border-l-4 border-l-primary' : ''}`}
                      onClick={() => handleEmailClick(email)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium text-sm ${!email.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {email.sender_name || email.sender_email}
                          </span>
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            {email.gmail_account?.email_address}
                          </Badge>
                        </div>
                        <h4 className={`text-sm mb-1 ${!email.is_read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                          {email.subject}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {email.snippet}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(email.received_at).toLocaleDateString()}
                      </span>
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
                  </CardContent>
                </Card>
              ))}

              {selectedTab === 'inbox' && emails.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No emails found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try syncing your connected accounts to load emails
                  </p>
                </div>
              )}
              
              {selectedTab === 'sent' && (
                <div className="text-center py-12">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sent emails yet</p>
                </div>
              )}
              
              {selectedTab === 'archived' && (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No archived emails</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Email Compose Modal */}
      <EmailCompose
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        accounts={accounts}
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
    </div>
  );
};

export default Email;