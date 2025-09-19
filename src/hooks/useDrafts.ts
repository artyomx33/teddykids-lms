import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Draft {
  id: string;
  gmail_account_id: string;
  to_emails: string[];
  cc_emails: string[];
  bcc_emails: string[];
  subject: string;
  body: string;
  reply_to_message_id?: string;
  created_at: string;
  updated_at: string;
}

interface UseDraftsReturn {
  drafts: Draft[];
  isLoading: boolean;
  saveDraft: (accountId: string, draftData: Partial<Draft>) => Promise<{ success: boolean; id?: string }>;
  deleteDraft: (draftId: string) => Promise<{ success: boolean }>;
  loadDraft: (draftId: string) => Draft | null;
  refreshDrafts: () => Promise<void>;
}

export const useDrafts = (): UseDraftsReturn => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshDrafts = async () => {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = async (accountId: string, draftData: Partial<Draft>): Promise<{ success: boolean; id?: string }> => {
    try {
      const draftPayload = {
        gmail_account_id: accountId,
        to_emails: draftData.to_emails || [],
        cc_emails: draftData.cc_emails || [],
        bcc_emails: draftData.bcc_emails || [],
        subject: draftData.subject || '',
        body: draftData.body || '',
        reply_to_message_id: draftData.reply_to_message_id,
        updated_at: new Date().toISOString()
      };

      let result;
      if (draftData.id) {
        // Update existing draft
        result = await supabase
          .from('email_drafts')
          .update(draftPayload)
          .eq('id', draftData.id)
          .select()
          .single();
      } else {
        // Create new draft
        result = await supabase
          .from('email_drafts')
          .insert(draftPayload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      await refreshDrafts();
      return { success: true, id: result.data.id };
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
      return { success: false };
    }
  };

  const deleteDraft = async (draftId: string): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase
        .from('email_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      await refreshDrafts();
      toast.success('Draft deleted');
      return { success: true };
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
      return { success: false };
    }
  };

  const loadDraft = (draftId: string): Draft | null => {
    return drafts.find(draft => draft.id === draftId) || null;
  };

  useEffect(() => {
    refreshDrafts();
  }, []);

  return {
    drafts,
    isLoading,
    saveDraft,
    deleteDraft,
    loadDraft,
    refreshDrafts
  };
};