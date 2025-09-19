import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle } from "lucide-react";

interface AccountSwitcherProps {
  accounts: Array<{
    id: string;
    email_address: string;
    display_name?: string;
    is_active: boolean;
    last_sync_at?: string;
  }>;
  selectedAccountId: string | null;
  onAccountChange: (accountId: string | null) => void;
}

export const AccountSwitcher = ({ accounts, selectedAccountId, onAccountChange }: AccountSwitcherProps) => {
  const handleValueChange = (value: string) => {
    if (value === 'all') {
      onAccountChange(null);
    } else {
      onAccountChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Filter by Account</label>
      <Select 
        value={selectedAccountId || 'all'} 
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>All Accounts</span>
              <Badge variant="secondary" className="ml-auto">
                {accounts.length}
              </Badge>
            </div>
          </SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-2 w-full">
                <div className="p-1 rounded bg-primary/10">
                  <Mail className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {account.display_name || account.email_address}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {account.email_address}
                  </div>
                </div>
                {account.is_active && (
                  <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};