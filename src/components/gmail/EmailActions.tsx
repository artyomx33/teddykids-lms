import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, Archive, Trash2, MoreHorizontal, MailOpen, MailX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailActionsProps {
  selectedEmails: string[];
  onSelectAll?: (checked: boolean) => void;
  onClearSelection?: () => void;
  onRefresh?: () => void;
  allSelected?: boolean;
  someSelected?: boolean;
}

export const EmailActions = ({ 
  selectedEmails, 
  onSelectAll, 
  onClearSelection, 
  onRefresh,
  allSelected,
  someSelected
}: EmailActionsProps) => {
  
  const handleBulkAction = async (action: string) => {
    if (selectedEmails.length === 0) return;

    try {
      let updateData: any = {};
      let toastMessage = '';

      switch (action) {
        case 'mark_read':
          updateData = { is_read: true };
          toastMessage = `Marked ${selectedEmails.length} emails as read`;
          break;
        case 'mark_unread':
          updateData = { is_read: false };
          toastMessage = `Marked ${selectedEmails.length} emails as unread`;
          break;
        case 'star':
          updateData = { is_starred: true };
          toastMessage = `Starred ${selectedEmails.length} emails`;
          break;
        case 'unstar':
          updateData = { is_starred: false };
          toastMessage = `Unstarred ${selectedEmails.length} emails`;
          break;
        case 'archive':
          updateData = { is_archived: true };
          toastMessage = `Archived ${selectedEmails.length} emails`;
          break;
        case 'unarchive':
          updateData = { is_archived: false };
          toastMessage = `Unarchived ${selectedEmails.length} emails`;
          break;
        case 'trash':
          updateData = { is_trashed: true };
          toastMessage = `Moved ${selectedEmails.length} emails to trash`;
          break;
        case 'untrash':
          updateData = { is_trashed: false };
          toastMessage = `Restored ${selectedEmails.length} emails from trash`;
          break;
        default:
          return;
      }

      const { error } = await supabase
        .from('emails')
        .update(updateData)
        .in('id', selectedEmails);

      if (error) throw error;

      toast.success(toastMessage);
      onClearSelection?.();
      onRefresh?.();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform action');
    }
  };

  const handleStarToggle = async (emailId: string, currentlyStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_starred: !currentlyStarred })
        .eq('id', emailId);

      if (error) throw error;

      toast.success(currentlyStarred ? 'Email unstarred' : 'Email starred');
      onRefresh?.();
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update email');
    }
  };

  const handleArchiveToggle = async (emailId: string, currentlyArchived: boolean) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_archived: !currentlyArchived })
        .eq('id', emailId);

      if (error) throw error;

      toast.success(currentlyArchived ? 'Email unarchived' : 'Email archived');
      onRefresh?.();
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast.error('Failed to update email');
    }
  };

  const handleTrashToggle = async (emailId: string, currentlyTrashed: boolean) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_trashed: !currentlyTrashed })
        .eq('id', emailId);

      if (error) throw error;

      toast.success(currentlyTrashed ? 'Email restored' : 'Email moved to trash');
      onRefresh?.();
    } catch (error) {
      console.error('Error toggling trash:', error);
      toast.error('Failed to update email');
    }
  };

  if (selectedEmails.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onSelectAll}
          aria-label="Select all emails"
        />
        <span className="text-sm text-muted-foreground">
          Select emails for bulk actions
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <Checkbox
        checked={allSelected}
        onCheckedChange={onSelectAll}
        aria-label="Select all emails"
      />
      
      <span className="text-sm font-medium">
        {selectedEmails.length} selected
      </span>

      <div className="flex items-center gap-1 ml-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkAction('mark_read')}
          title="Mark as read"
        >
          <MailOpen className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkAction('mark_unread')}
          title="Mark as unread"
        >
          <MailX className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkAction('star')}
          title="Star"
        >
          <Star className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkAction('archive')}
          title="Archive"
        >
          <Archive className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkAction('trash')}
          title="Move to trash"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleBulkAction('unstar')}>
              Unstar all
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('unarchive')}>
              Unarchive all
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('untrash')}>
              Restore from trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="ml-auto"
      >
        Clear selection
      </Button>
    </div>
  );
};

// Individual email action functions for use in email list items
export const useEmailActions = () => {
  const starEmail = async (emailId: string, currentlyStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_starred: !currentlyStarred })
        .eq('id', emailId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error toggling star:', error);
      return { success: false, error };
    }
  };

  const archiveEmail = async (emailId: string, currentlyArchived: boolean) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_archived: !currentlyArchived })
        .eq('id', emailId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error toggling archive:', error);
      return { success: false, error };
    }
  };

  const trashEmail = async (emailId: string, currentlyTrashed: boolean) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_trashed: !currentlyTrashed })
        .eq('id', emailId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error toggling trash:', error);
      return { success: false, error };
    }
  };

  return { starEmail, archiveEmail, trashEmail };
};