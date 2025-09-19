import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface SearchFilters {
  query: string;
  sender: string;
  hasAttachments?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  isRead?: boolean;
  isStarred?: boolean;
  accountId?: string;
}

interface EmailSearchProps {
  accounts: Array<{
    id: string;
    email_address: string;
    display_name?: string;
  }>;
  onSearch: (emails: any[]) => void;
  onClearSearch: () => void;
}

export const EmailSearch = ({ accounts, onSearch, onClearSearch }: EmailSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sender: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!filters.query && !filters.sender && !filters.accountId && !filters.dateFrom) {
      onClearSearch();
      return;
    }

    setIsSearching(true);
    
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

      // Text search in subject and body
      if (filters.query) {
        query = query.or(`subject.ilike.%${filters.query}%, body_text.ilike.%${filters.query}%`);
      }

      // Filter by sender
      if (filters.sender) {
        query = query.ilike('sender_email', `%${filters.sender}%`);
      }

      // Filter by account
      if (filters.accountId) {
        query = query.eq('gmail_account_id', filters.accountId);
      }

      // Filter by date range
      if (filters.dateFrom) {
        query = query.gte('received_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('received_at', endDate.toISOString());
      }

      // Filter by status
      if (filters.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }
      if (filters.isStarred !== undefined) {
        query = query.eq('is_starred', filters.isStarred);
      }
      if (filters.hasAttachments !== undefined) {
        query = query.eq('has_attachments', filters.hasAttachments);
      }

      const { data, error } = await query
        .order('received_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      onSearch(data || []);
      updateActiveFilters();
    } catch (error) {
      console.error('Error searching emails:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const updateActiveFilters = () => {
    const active: string[] = [];
    if (filters.query) active.push(`Text: "${filters.query}"`);
    if (filters.sender) active.push(`From: ${filters.sender}`);
    if (filters.accountId) active.push('Account filtered');
    if (filters.dateFrom) active.push(`From: ${format(filters.dateFrom, 'MMM dd')}`);
    if (filters.dateTo) active.push(`To: ${format(filters.dateTo, 'MMM dd')}`);
    if (filters.isRead === true) active.push('Read only');
    if (filters.isRead === false) active.push('Unread only');
    if (filters.isStarred) active.push('Starred only');
    if (filters.hasAttachments) active.push('With attachments');
    
    setActiveFilters(active);
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      sender: ''
    });
    setActiveFilters([]);
    onClearSearch();
  };

  const removeFilter = (filterToRemove: string) => {
    const newFilters = { ...filters };
    
    if (filterToRemove.startsWith('Text:')) {
      newFilters.query = '';
    } else if (filterToRemove.startsWith('From:') && !filterToRemove.includes('MMM')) {
      newFilters.sender = '';
    } else if (filterToRemove.includes('Account')) {
      newFilters.accountId = undefined;
    } else if (filterToRemove.startsWith('From:') && filterToRemove.includes('MMM')) {
      newFilters.dateFrom = undefined;
    } else if (filterToRemove.startsWith('To:')) {
      newFilters.dateTo = undefined;
    } else if (filterToRemove.includes('Read')) {
      newFilters.isRead = undefined;
    } else if (filterToRemove.includes('Starred')) {
      newFilters.isStarred = undefined;
    } else if (filterToRemove.includes('attachments')) {
      newFilters.hasAttachments = undefined;
    }
    
    setFilters(newFilters);
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (filters.query || filters.sender) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filters.query, filters.sender]);

  return (
    <div className="space-y-3">
      {/* Main search bar */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pl-10"
          />
        </div>
        
        {/* Advanced filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>
              
              {/* Sender filter */}
              <div>
                <label className="text-sm font-medium">From</label>
                <Input
                  placeholder="Sender email..."
                  value={filters.sender}
                  onChange={(e) => setFilters({ ...filters, sender: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Account filter */}
              <div>
                <label className="text-sm font-medium">Account</label>
                <Select 
                  value={filters.accountId || ''} 
                  onValueChange={(value) => setFilters({ ...filters, accountId: value || undefined })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.display_name || account.email_address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "MMM dd") : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "MMM dd") : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Status filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select 
                    value={filters.isRead === undefined ? '' : filters.isRead.toString()} 
                    onValueChange={(value) => setFilters({ ...filters, isRead: value === '' ? undefined : value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Read status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="true">Read</SelectItem>
                      <SelectItem value="false">Unread</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filters.hasAttachments === undefined ? '' : filters.hasAttachments.toString()} 
                    onValueChange={(value) => setFilters({ ...filters, hasAttachments: value === '' ? undefined : value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Attachments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="true">With attachments</SelectItem>
                      <SelectItem value="false">No attachments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1" disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {filter}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};