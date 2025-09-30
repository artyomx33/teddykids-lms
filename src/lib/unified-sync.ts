/**
 * 🚀 UNIFIED SYNC SERVICE
 * One sync to rule them all - employees + wages + contracts + everything!
 */

import { supabase } from "@/integrations/supabase/client";

export interface ComprehensiveEmployeeData {
  // Basic employee info
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  location: string;

  // Employment details
  employment_start_date: string;
  employment_end_date?: string;
  hours_per_week: number;
  contract_type: 'temporary' | 'permanent' | 'internship';

  // Wage information
  salary_amount: number;
  hourly_rate: number;
  cao_scale?: string;
  last_salary_update: string;

  // Contract status
  current_contract_status: 'active' | 'ending_soon' | 'expired' | 'future';
  contract_number: number;

  // Employes.nl integration
  employes_employee_id: string;
  last_sync_at: string;
}

export interface UnifiedSyncResult {
  success: boolean;
  employees_processed: number;
  contracts_created: number;
  contracts_updated: number;
  wages_updated: number;
  errors: string[];
  summary: string;
}

/**
 * 🎯 THE ONE SYNC FUNCTION TO RULE THEM ALL
 * Fetches everything from Employes.nl and creates perfect data
 */
export async function executeUnifiedSync(): Promise<UnifiedSyncResult> {
  console.log('🚀 Starting unified sync - ONE sync to rule them all!');

  let employeesProcessed = 0;
  let contractsCreated = 0;
  let contractsUpdated = 0;
  let wagesUpdated = 0;
  const errors: string[] = [];

  try {
    // Execute the real unified sync sequence
    const syncResults = await executeRealUnifiedSync();

    // Count results from actual sync operations
    employeesProcessed = syncResults.employees?.length || 0;

    // Try to get more detailed counts from sync results
    if (syncResults.syncResults?.synced) {
      contractsCreated = syncResults.syncResults.synced;
    }

    if (syncResults.wageResults?.updated) {
      wagesUpdated = syncResults.wageResults.updated;
    }

    // Clean up any orphaned data using our existing fix
    console.log('7️⃣ Cleaning up orphaned contracts...');
    const { linkOrphanedContracts } = await import('./contract-fixes');
    const cleanupResult = await linkOrphanedContracts();

    if (cleanupResult.fixed > 0) {
      contractsUpdated += cleanupResult.fixed;
    }

    if (cleanupResult.errors.length > 0) {
      errors.push(...cleanupResult.errors);
    }

    return {
      success: errors.length === 0,
      employees_processed: employeesProcessed,
      contracts_created: contractsCreated,
      contracts_updated: contractsUpdated,
      wages_updated: wagesUpdated,
      errors,
      summary: `✅ Processed ${employeesProcessed} employees. ${contractsCreated} new contracts, ${contractsUpdated} updated contracts, ${wagesUpdated} wage updates.`
    };

  } catch (error) {
    console.error('💥 Unified sync failed:', error);
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

/**
 * REAL unified sync using actual Employes.nl API sequence
 */
async function executeRealUnifiedSync(): Promise<{
  employees: any[];
  comparison: any;
  syncResults: any;
  wageResults: any;
  contractResults: any;
}> {
  console.log('📡 Starting REAL unified sync sequence...');

  // Step 1: Fetch employees from Employes.nl
  console.log('1️⃣ Fetching employees from Employes.nl...');
  const { data: employeesData, error: employeesError } = await supabase.functions.invoke('employes-integration', {
    body: { action: 'fetch_employees' }
  });

  if (employeesError) {
    throw new Error(`Failed to fetch employees: ${employeesError.message}`);
  }

  // Check for the actual API response structure: data.data.data
  const employees = employeesData?.data?.data || employeesData?.data || employeesData?.employees;

  if (!employees || !Array.isArray(employees) || employees.length === 0) {
    console.log('API Response structure:', JSON.stringify(employeesData, null, 2));
    throw new Error('No employee data received from Employes.nl');
  }

  console.log(`📋 Received ${employees.length} employees from Employes.nl`);

  // Step 2: Compare with existing LMS data
  console.log('2️⃣ Comparing with existing LMS data...');
  const { data: comparisonData, error: comparisonError } = await supabase.functions.invoke('employes-integration', {
    body: { action: 'compare_staff_data' }
  });

  if (comparisonError) {
    console.warn('Comparison failed, continuing anyway:', comparisonError.message);
  }

  console.log('📊 Data comparison completed');

  // Step 3: Sync employees to LMS
  console.log('3️⃣ Syncing employees to LMS...');
  const { data: syncData, error: syncError } = await supabase.functions.invoke('employes-integration', {
    body: { action: 'sync_employees' }
  });

  if (syncError) {
    console.warn('Employee sync had issues:', syncError.message);
  }

  console.log('👥 Employee sync completed');

  // Step 4: Sync wage data
  console.log('4️⃣ Syncing wage data...');
  const { data: wageData, error: wageError } = await supabase.functions.invoke('employes-integration', {
    body: { action: 'sync_wage_data' }
  });

  if (wageError) {
    console.warn('Wage sync had issues:', wageError.message);
  }

  console.log('💰 Wage sync completed');

  // Step 5: Stage all employee data safely
  console.log('5️⃣ Staging employee data safely...');
  const { data: stagingData, error: stagingError } = await supabase.functions.invoke('employes-integration', {
    body: { action: 'stage_employee_data' }
  });

  if (stagingError) {
    console.warn('Staging had issues:', stagingError.message);
  } else {
    console.log('💾 Employee data staged successfully');
  }

  // Step 6: Sync contracts from staged data
  console.log('6️⃣ Syncing contracts from staged data...');
  const { data: contractData, error: contractError } = await supabase.functions.invoke('employes-integration', {
    body: { action: 'sync_from_staging' }
  });

  if (contractError) {
    console.warn('Contract sync had issues:', contractError.message);
  }

  console.log('📄 Contract sync completed');

  return {
    employees: employees,
    comparison: comparisonData,
    syncResults: syncData,
    wageResults: wageData,
    contractResults: contractData
  };
}

/**
 * Clean up orphaned records and ensure data consistency
 * (Now delegated to existing contract-fixes.ts)
 */
async function cleanupOrphanedRecords(): Promise<void> {
  console.log('🧹 Cleaning up orphaned records...');

  // Use the existing proven contract fix system
  const { linkOrphanedContracts } = await import('./contract-fixes');
  const result = await linkOrphanedContracts();

  console.log(`✅ Linked ${result.fixed} orphaned contracts`);
  if (result.errors.length > 0) {
    console.warn('Some cleanup warnings:', result.errors);
  }
}

/**
 * Get unified employment data for Staff Profile display
 */
export async function getUnifiedEmploymentData(staffId: string) {
  const { data, error } = await supabase
    .from('staff')
    .select(`
      *,
      contracts!inner(
        id,
        start_date,
        end_date,
        contract_type,
        status,
        hours_per_week,
        salary_amount,
        hourly_rate,
        contract_number
      )
    `)
    .eq('id', staffId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch unified employment data: ${error.message}`);
  }

  return data;
}