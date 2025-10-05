/**
 * Unified Sync Service
 *
 * Simplified sync functionality for Labs 2.0
 */

import { supabase } from "@/integrations/supabase/client";

export interface UnifiedSyncResult {
  success: boolean;
  employees_processed: number;
  contracts_created: number;
  contracts_updated: number;
  wages_updated: number;
  errors: string[];
  summary: string;
}

export async function executeUnifiedSync(): Promise<UnifiedSyncResult> {
  try {
    console.log('🚀 Starting unified sync...');

    // Use the existing Employes integration function
    const { data, error } = await supabase.functions.invoke('employes-integration', {
      body: { action: 'sync_contracts' }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Process the result
    const result: UnifiedSyncResult = {
      success: true,
      employees_processed: data?.total || 0,
      contracts_created: data?.synced || 0,
      contracts_updated: 0,
      wages_updated: 0,
      errors: [],
      summary: `✅ Successfully processed ${data?.total || 0} employees and synced ${data?.synced || 0} contracts`
    };

    console.log('✅ Unified sync completed:', result);
    return result;

  } catch (error) {
    console.error('❌ Unified sync failed:', error);

    return {
      success: false,
      employees_processed: 0,
      contracts_created: 0,
      contracts_updated: 0,
      wages_updated: 0,
      errors: [error.message],
      summary: `❌ Sync failed: ${error.message}`
    };
  }
}