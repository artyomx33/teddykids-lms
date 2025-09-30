/**
 * 🚨 EMERGENCY CONTRACT FIX
 * Fixes orphaned contract records with NULL staff_id
 */

import { supabase } from "@/integrations/supabase/client";

export interface OrphanedContract {
  id: string;
  employee_name: string;
  staff_id: string | null;
  contract_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
}

export interface StaffMember {
  id: string;
  full_name: string;
  employment_start_date: string | null;
  employment_end_date: string | null;
  salary_amount: number | null;
  hours_per_week: number | null;
}

/**
 * Find all orphaned contracts (contracts with NULL staff_id)
 */
export async function findOrphanedContracts(): Promise<OrphanedContract[]> {
  const { data, error } = await supabase
    .from('contracts')
    .select('id, employee_name, staff_id, contract_type, status, start_date, end_date')
    .is('staff_id', null);

  if (error) {
    console.error('Error finding orphaned contracts:', error);
    return [];
  }

  return data || [];
}

/**
 * Find staff member by full name
 */
export async function findStaffByName(fullName: string): Promise<StaffMember | null> {
  const { data, error } = await supabase
    .from('staff')
    .select('id, full_name, employment_start_date, employment_end_date, salary_amount, hours_per_week')
    .eq('full_name', fullName)
    .single();

  if (error) {
    console.error(`Error finding staff member ${fullName}:`, error);
    return null;
  }

  return data;
}

/**
 * Fix a single orphaned contract by linking it to the correct staff member
 */
export async function fixOrphanedContract(contractId: string, staffId: string): Promise<boolean> {
  // Get staff member data to set proper contract details
  const { data: staff } = await supabase
    .from('staff')
    .select('employment_start_date, employment_end_date, hours_per_week, contract_type')
    .eq('id', staffId)
    .single();

  if (!staff) {
    console.error('Staff member not found for fixing contract');
    return false;
  }

  // Update contract with proper data
  const { error } = await supabase
    .from('contracts')
    .update({
      staff_id: staffId,
      status: 'active', // Change from 'draft' to 'active'
      contract_type: staff.contract_type || 'fixed', // Set proper contract type
      start_date: staff.employment_start_date,
      end_date: staff.employment_end_date,
      hours_per_week: staff.hours_per_week || 36
    })
    .eq('id', contractId);

  if (error) {
    console.error(`Error fixing contract ${contractId}:`, error);
    return false;
  }

  console.log(`✅ Fixed contract ${contractId} - linked to staff ${staffId}`);
  return true;
}

/**
 * Auto-fix all orphaned contracts by matching employee names
 */
export async function autoFixOrphanedContracts(): Promise<{ fixed: number; failed: string[] }> {
  const orphanedContracts = await findOrphanedContracts();
  let fixed = 0;
  const failed: string[] = [];

  for (const contract of orphanedContracts) {
    console.log(`Attempting to fix contract for: ${contract.employee_name}`);

    const staff = await findStaffByName(contract.employee_name);
    if (!staff) {
      failed.push(`No staff member found for: ${contract.employee_name}`);
      continue;
    }

    const success = await fixOrphanedContract(contract.id, staff.id);
    if (success) {
      fixed++;
    } else {
      failed.push(`Failed to fix contract for: ${contract.employee_name}`);
    }
  }

  return { fixed, failed };
}

/**
 * Get contract fix status report
 */
export async function getContractFixReport() {
  const orphanedContracts = await findOrphanedContracts();

  return {
    totalOrphaned: orphanedContracts.length,
    orphanedContracts: orphanedContracts.map(c => ({
      id: c.id,
      employeeName: c.employee_name,
      contractType: c.contract_type,
      status: c.status,
      startDate: c.start_date
    }))
  };
}