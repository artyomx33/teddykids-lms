import { supabase } from "@/integrations/supabase/client";
import { buildEmploymentJourney } from "./employesContracts";

/**
 * Sync employment data from Employes.nl to contracts table
 * This creates contract records from real employment data
 */
export async function syncEmploymentToContracts(staffId: string) {
  console.log('[syncEmploymentToContracts] Starting sync for staff:', staffId);
  
  try {
    // Build employment journey from real data
    const journey = await buildEmploymentJourney(staffId);
    
    if (!journey || journey.contracts.length === 0) {
      console.log('[syncEmploymentToContracts] No employment data to sync');
      return { success: false, error: 'No employment data found' };
    }
    
    console.log('[syncEmploymentToContracts] Found', journey.contracts.length, 'contracts to sync');
    
    // Get staff details for contract creation
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('id', staffId)
      .single();
    
    if (staffError || !staff) {
      console.error('[syncEmploymentToContracts] Error fetching staff:', staffError);
      return { success: false, error: staffError?.message || 'Staff not found' };
    }
    
    // Check existing contracts for this staff
    const { data: existingContracts } = await supabase
      .from('contracts')
      .select('id, query_params')
      .eq('staff_id', staffId);
    
    // Create contracts from employment periods
    const contractsToInsert = [];
    
    for (const contract of journey.contracts) {
      // Check if we already have a contract for this period
      const exists = existingContracts?.some(ec => 
        ec.query_params?.startDate === contract.startDate
      );
      
      if (!exists) {
        contractsToInsert.push({
          staff_id: staffId,
          employee_name: staff.full_name,
          full_name: staff.full_name,
          status: contract.isActive ? 'active' : 'completed',
          contract_type: contract.employmentType === 'permanent' ? 'permanent' : 'fixed_term',
          department: staff.department,
          manager: null, // Will be set based on staff assignments
          query_params: {
            startDate: contract.startDate,
            endDate: contract.endDate,
            hoursPerWeek: contract.hoursPerWeek,
            daysPerWeek: contract.daysPerWeek,
            contractType: contract.contractType,
            employmentType: contract.employmentType,
            hourlyWage: contract.hourlyWage,
            monthlyWage: contract.monthlyWage,
            yearlyWage: contract.yearlyWage,
            source: 'employes_sync'
          }
        });
      }
    }
    
    if (contractsToInsert.length > 0) {
      console.log('[syncEmploymentToContracts] Inserting', contractsToInsert.length, 'new contracts');
      
      const { error: insertError } = await supabase
        .from('contracts')
        .insert(contractsToInsert);
      
      if (insertError) {
        console.error('[syncEmploymentToContracts] Error inserting contracts:', insertError);
        return { success: false, error: insertError.message };
      }
      
      console.log('[syncEmploymentToContracts] Successfully synced contracts');
      return { success: true, contractsCreated: contractsToInsert.length };
    } else {
      console.log('[syncEmploymentToContracts] All contracts already exist');
      return { success: true, contractsCreated: 0 };
    }
    
  } catch (error: any) {
    console.error('[syncEmploymentToContracts] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync all staff employment data to contracts
 */
export async function syncAllEmploymentToContracts() {
  console.log('[syncAllEmploymentToContracts] Starting full sync');
  
  try {
    // Get all active staff with employes_id
    const { data: staffList, error: staffError } = await supabase
      .from('staff')
      .select('id, full_name, employes_id')
      .eq('status', 'active')
      .not('employes_id', 'is', null);
    
    if (staffError) {
      console.error('[syncAllEmploymentToContracts] Error fetching staff:', staffError);
      return { success: false, error: staffError.message };
    }
    
    if (!staffList || staffList.length === 0) {
      console.log('[syncAllEmploymentToContracts] No staff to sync');
      return { success: true, totalSynced: 0 };
    }
    
    console.log('[syncAllEmploymentToContracts] Syncing', staffList.length, 'staff members');
    
    let totalContractsCreated = 0;
    const errors: string[] = [];
    
    for (const staff of staffList) {
      const result = await syncEmploymentToContracts(staff.id);
      
      if (result.success) {
        totalContractsCreated += result.contractsCreated || 0;
      } else {
        errors.push(`${staff.full_name}: ${result.error}`);
      }
    }
    
    console.log('[syncAllEmploymentToContracts] Sync complete. Created:', totalContractsCreated, 'Errors:', errors.length);
    
    return {
      success: true,
      totalSynced: staffList.length,
      totalContractsCreated,
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error: any) {
    console.error('[syncAllEmploymentToContracts] Error:', error);
    return { success: false, error: error.message };
  }
}
