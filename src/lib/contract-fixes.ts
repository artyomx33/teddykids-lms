import { supabase } from "@/integrations/supabase/client";

/**
 * IMMEDIATE FIX: Link orphaned contract records to staff members
 * This resolves the "draft unknown" issue by connecting contracts to staff
 */
export async function linkOrphanedContracts(): Promise<{ fixed: number; errors: string[] }> {
  console.log('🔧 Starting orphaned contract linking process...');

  const errors: string[] = [];
  let fixed = 0;

  try {
    // 1. Find all orphaned contracts (staff_id is NULL)
    const { data: orphanedContracts, error: fetchError } = await supabase
      .from('contracts')
      .select('id, employee_name, contract_type, status, query_params')
      .is('staff_id', null);

    if (fetchError) {
      throw new Error(`Failed to fetch orphaned contracts: ${fetchError.message}`);
    }

    console.log(`📋 Found ${orphanedContracts?.length || 0} orphaned contracts`);

    for (const contract of orphanedContracts || []) {
      try {
        // 2. Find matching staff record by name
        const { data: staffRecords, error: staffError } = await supabase
          .from('staff')
          .select('id, full_name')
          .ilike('full_name', contract.employee_name);

        if (staffError) {
          errors.push(`Error finding staff for ${contract.employee_name}: ${staffError.message}`);
          continue;
        }

        if (!staffRecords || staffRecords.length === 0) {
          errors.push(`No staff record found for: ${contract.employee_name}`);
          continue;
        }

        if (staffRecords.length > 1) {
          errors.push(`Multiple staff records found for: ${contract.employee_name}`);
          continue;
        }

        const staffRecord = staffRecords[0];

        // 3. Update contract with staff_id and improve status
        const updatePayload: any = {
          staff_id: staffRecord.id
        };

        // Fix contract status if it's unknown or draft with no real data
        if (contract.contract_type === 'unknown' && contract.status === 'draft') {
          // Try to infer better status from query_params or staff data
          updatePayload.status = 'active'; // Default to active for linked contracts

          // If we have start/end dates, we can make it more accurate
          if (contract.query_params?.startDate) {
            const startDate = new Date(contract.query_params.startDate);
            const today = new Date();

            if (startDate > today) {
              updatePayload.status = 'pending';
            } else if (contract.query_params?.endDate) {
              const endDate = new Date(contract.query_params.endDate);
              if (endDate < today) {
                updatePayload.status = 'expired';
              }
            }
          }
        }

        // 4. Update the contract
        const { error: updateError } = await supabase
          .from('contracts')
          .update(updatePayload)
          .eq('id', contract.id);

        if (updateError) {
          errors.push(`Failed to update contract ${contract.id}: ${updateError.message}`);
          continue;
        }

        fixed++;
        console.log(`✅ Linked contract ${contract.id} to staff ${staffRecord.full_name}`);

      } catch (error) {
        errors.push(`Error processing contract ${contract.id}: ${error.message}`);
      }
    }

    console.log(`🎉 Fixed ${fixed} orphaned contracts`);
    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} errors encountered:`, errors);
    }

    return { fixed, errors };

  } catch (error) {
    console.error('💥 Critical error in linkOrphanedContracts:', error);
    throw error;
  }
}

/**
 * Delete truly orphaned contracts that cannot be linked
 */
export async function deleteUnlinkableContracts(): Promise<{ deleted: number; errors: string[] }> {
  console.log('🗑️ Starting unlinkable contract cleanup...');

  const errors: string[] = [];
  let deleted = 0;

  try {
    // Find contracts that still have NULL staff_id after linking attempt
    const { data: stillOrphaned, error: fetchError } = await supabase
      .from('contracts')
      .select('id, employee_name, status, contract_type')
      .is('staff_id', null);

    if (fetchError) {
      throw new Error(`Failed to fetch still orphaned contracts: ${fetchError.message}`);
    }

    console.log(`📋 Found ${stillOrphaned?.length || 0} still orphaned contracts`);

    for (const contract of stillOrphaned || []) {
      // Only delete if it's clearly a broken/test record
      if (contract.contract_type === 'unknown' && contract.status === 'draft') {
        const { error: deleteError } = await supabase
          .from('contracts')
          .delete()
          .eq('id', contract.id);

        if (deleteError) {
          errors.push(`Failed to delete contract ${contract.id}: ${deleteError.message}`);
          continue;
        }

        deleted++;
        console.log(`🗑️ Deleted orphaned contract ${contract.id} for ${contract.employee_name}`);
      }
    }

    console.log(`🧹 Deleted ${deleted} unlinkable contracts`);
    return { deleted, errors };

  } catch (error) {
    console.error('💥 Critical error in deleteUnlinkableContracts:', error);
    throw error;
  }
}

/**
 * Comprehensive contract cleanup - link what can be linked, delete what can't
 */
export async function fixContractConsistency(): Promise<{
  linked: number;
  deleted: number;
  errors: string[];
}> {
  console.log('🔧 Starting comprehensive contract consistency fix...');

  const linkResult = await linkOrphanedContracts();
  const deleteResult = await deleteUnlinkableContracts();

  return {
    linked: linkResult.fixed,
    deleted: deleteResult.deleted,
    errors: [...linkResult.errors, ...deleteResult.errors]
  };
}