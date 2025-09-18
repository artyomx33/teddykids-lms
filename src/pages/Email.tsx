import { useState } from "react";
import { Mail, Plus, Search, Filter, Settings, Inbox, Send, Archive, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Email() {
  const [selectedTab, setSelectedTab] = useState("inbox");

  // Mock data for initial design
  const emailAccounts = [
    { email: "admin@teddykids.nl", unread: 12 },
    { email: "hr@teddykids.nl", unread: 5 },
    { email: "info@teddykids.nl", unread: 8 }
  ];

  const emailLabels = [
    { name: "Contracts", count: 15, color: "bg-blue-500" },
    { name: "HR", count: 8, color: "bg-green-500" },
    { name: "Applications", count: 12, color: "bg-purple-500" },
    { name: "Urgent", count: 3, color: "bg-red-500" },
    { name: "Reviews", count: 6, color: "bg-orange-500" }
  ];

  const mockEmails = [
    {
      id: 1,
      sender: "John Doe",
      email: "john.doe@example.com",
      subject: "Contract renewal discussion",
      snippet: "Hi, I wanted to discuss the upcoming contract renewal for the teaching position...",
      time: "10:30 AM",
      isRead: false,
      labels: ["Contracts", "Urgent"]
    },
    {
      id: 2,
      sender: "Maria Garcia",
      email: "m.garcia@school.edu",
      subject: "Application for intern position",
      snippet: "Dear HR team, I am writing to apply for the intern position advertised...",
      time: "9:15 AM",
      isRead: true,
      labels: ["Applications", "HR"]
    },
    {
      id: 3,
      sender: "System Admin",
      email: "system@teddykids.nl",
      subject: "Performance review reminder",
      snippet: "This is an automated reminder that performance reviews are due...",
      time: "Yesterday",
      isRead: false,
      labels: ["Reviews"]
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Email</h1>
          </div>

          {/* Connected Accounts */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Accounts</h3>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {emailAccounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                  <span className="text-sm truncate">{account.email}</span>
                  {account.unread > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {account.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Navigation */}
          <nav className="space-y-1 mb-6">
            {[
              { id: "inbox", label: "Inbox", icon: Inbox, count: 25 },
              { id: "sent", label: "Sent", icon: Send, count: 0 },
              { id: "archived", label: "Archived", icon: Archive, count: 0 }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedTab(item.id)}
                className={`w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-accent ${
                  selectedTab === item.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
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

          {/* Labels */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Labels</h3>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {emailLabels.map((label, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${label.color}`} />
                    <span className="text-sm">{label.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {label.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold capitalize">{selectedTab}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Compose
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Email List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {selectedTab === "inbox" ? (
              mockEmails.map((email) => (
                <Card
                  key={email.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    !email.isRead ? "border-l-4 border-l-primary bg-accent/20" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${!email.isRead ? "font-semibold" : ""}`}>
                            {email.sender}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {email.email}
                          </span>
                        </div>
                        <h4 className={`text-sm mb-2 ${!email.isRead ? "font-semibold" : ""}`}>
                          {email.subject}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {email.snippet}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-muted-foreground">{email.time}</span>
                        <div className="flex gap-1 flex-wrap">
                          {email.labels.map((label, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No emails in {selectedTab}</h3>
                  <p className="text-muted-foreground">
                    {selectedTab === "sent" 
                      ? "Emails you send will appear here" 
                      : "Archived emails will appear here"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Welcome Message for Empty State */}
      {emailAccounts.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
              <CardTitle>Welcome to Email Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Connect your Gmail accounts to start managing all your emails in one place.
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Connect Gmail Account
              </Button>
              <div className="text-sm text-muted-foreground">
                <p>Features coming soon:</p>
                <ul className="mt-2 space-y-1">
                  <li>• AI-powered email categorization</li>
                  <li>• Smart reply suggestions</li>
                  <li>• Real-time notifications</li>
                  <li>• Advanced search and filtering</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}