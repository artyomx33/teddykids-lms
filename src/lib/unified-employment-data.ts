import { supabase } from "@/integrations/supabase/client";
import type { ContractsEnrichedRow } from "@/types/contractsEnriched";

// Data source priority: Employes Sync > Contract Generation > Manual Entry
export type DataSource = 'employes_sync' | 'contract_generated' | 'manual_entry' | 'unknown';

export interface CurrentEmployment {
  staffId: string;
  fullName: string;
  position: string | null;
  location: string | null;
  department: string | null;
  startDate: string | null;
  endDate: string | null;
  contractType: string | null;
  dataSource: DataSource;
  lastVerified: string | null;
}

export interface SalaryHistoryRecord {
  id: string;
  scale: string | null;
  trede: string | null;
  grossMonthly: number;
  hourlyWage: number | null;
  hoursPerWeek: number;
  yearlyWage: number | null;
  caoEffectiveDate: string;
  validFrom: string;
  validTo: string | null;
  dataSource: string | null;
}

export interface EmploymentHistoryRecord {
  id: string;
  changeType: string;
  effectiveDate: string;
  previousData: any;
  newData: any;
  createdAt: string;
}

export interface ContractRecord {
  id: string;
  startDate: string | null;
  endDate: string | null;
  contractType: string | null;
  position: string | null;
  department: string | null;
  status: string | null;
  createdAt: string | null;
}

export interface UnifiedEmploymentData {
  current: CurrentEmployment;
  salaryHistory: SalaryHistoryRecord[];
  employmentHistory: EmploymentHistoryRecord[];
  contracts: ContractRecord[];
  dataQuality: {
    hasEmployesSync: boolean;
    hasContractData: boolean;
    hasManualData: boolean;
    confidence: 'verified' | 'calculated' | 'manual' | 'incomplete';
  };
}

export class UnifiedEmploymentService {
  /**
   * Single source of truth for all employment data
   * Queries contracts_enriched as primary source with historical data
   */
  static async getEmploymentData(staffId: string): Promise<UnifiedEmploymentData | null> {
    console.log('[UnifiedEmploymentService] Fetching data for staff:', staffId);

    try {
      // 1. Fetch from contracts_enriched (primary source)
      const { data: enrichedContracts, error: contractsError } = await supabase
        .from('contracts_enriched_v2')
        .select('*')
        .eq('staff_id', staffId)
        .order('start_date', { ascending: false });

      if (contractsError) {
        console.error('[UnifiedEmploymentService] Error fetching contracts:', contractsError);
        throw contractsError;
      }

      // 2. Fetch salary history
      const { data: salaryHistory, error: salaryError } = await supabase
        .from('cao_salary_history')
        .select('*')
        .eq('staff_id', staffId)
        .order('valid_from', { ascending: false });

      if (salaryError) {
        console.error('[UnifiedEmploymentService] Error fetching salary history:', salaryError);
      }

      // 3. Fetch employment history
      const { data: employmentHistory, error: historyError } = await supabase
        .from('staff_employment_history')
        .select('*')
        .eq('staff_id', staffId)
        .order('effective_date', { ascending: false });

      if (historyError) {
        console.error('[UnifiedEmploymentService] Error fetching employment history:', historyError);
      }

      // 4. Fetch staff record for fallback data
      const { data: staffRecord, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single();

      if (staffError) {
        console.error('[UnifiedEmploymentService] Error fetching staff record:', staffError);
      }

      if (!enrichedContracts || enrichedContracts.length === 0) {
        console.warn('[UnifiedEmploymentService] No contracts found for staff:', staffId);
        // Return minimal data from staff record if available
        if (staffRecord) {
          return this.buildFromStaffRecord(staffRecord, salaryHistory || [], employmentHistory || []);
        }
        return null;
      }

      // 5. Resolve current employment from contracts_enriched
      const currentContract = this.resolveCurrentEmployment(enrichedContracts);
      
      // 6. Determine data source priority
      const dataSource = this.determineDataSource(
        staffRecord,
        salaryHistory || [],
        employmentHistory || []
      );

      // 7. Build unified data structure
      const unifiedData: UnifiedEmploymentData = {
        current: {
          staffId,
          fullName: currentContract.full_name || staffRecord?.full_name || 'Unknown',
          position: currentContract.position,
          location: currentContract.location_key,
          department: (currentContract as any).department,
          startDate: currentContract.start_date,
          endDate: currentContract.end_date,
          contractType: (currentContract as any).contract_type,
          dataSource,
          lastVerified: staffRecord?.last_sync_at || null,
        },
        salaryHistory: (salaryHistory || []).map(s => ({
          id: s.id,
          scale: s.scale,
          trede: s.trede,
          grossMonthly: s.gross_monthly,
          hourlyWage: s.hourly_wage,
          hoursPerWeek: s.hours_per_week,
          yearlyWage: s.yearly_wage,
          caoEffectiveDate: s.cao_effective_date,
          validFrom: s.valid_from,
          validTo: s.valid_to,
          dataSource: s.data_source,
        })),
        employmentHistory: (employmentHistory || []).map(h => ({
          id: h.id,
          changeType: h.change_type,
          effectiveDate: h.effective_date,
          previousData: h.previous_data,
          newData: h.new_data,
          createdAt: h.created_at,
        })),
        contracts: enrichedContracts.map(c => ({
          id: c.id!,
          startDate: c.start_date,
          endDate: c.end_date,
          contractType: (c as any).contract_type,
          position: c.position,
          department: (c as any).department,
          status: (c as any).status,
          createdAt: c.created_at,
        })),
        dataQuality: this.assessDataQuality(dataSource, salaryHistory || [], employmentHistory || []),
      };

      console.log('[UnifiedEmploymentService] Data resolved:', {
        dataSource,
        contractsCount: enrichedContracts.length,
        salaryRecords: salaryHistory?.length || 0,
        historyRecords: employmentHistory?.length || 0,
        confidence: unifiedData.dataQuality.confidence,
      });

      return unifiedData;
    } catch (error) {
      console.error('[UnifiedEmploymentService] Fatal error:', error);
      return null;
    }
  }

  /**
   * Resolve current employment from contracts_enriched
   * Priority: Active contract > Most recent contract > First contract
   */
  private static resolveCurrentEmployment(contracts: ContractsEnrichedRow[]): ContractsEnrichedRow {
    const now = new Date().toISOString().split('T')[0];
    
    // Try to find active contract (start <= now <= end OR start <= now and no end)
    const activeContract = contracts.find(c => {
      const start = c.start_date;
      const end = c.end_date;
      
      if (!start) return false;
      
      if (!end) {
        return start <= now;
      }
      
      return start <= now && now <= end;
    });

    if (activeContract) {
      console.log('[UnifiedEmploymentService] Found active contract:', activeContract.id);
      return activeContract;
    }

    // Fallback to most recent contract
    console.log('[UnifiedEmploymentService] No active contract, using most recent');
    return contracts[0]; // Already sorted by start_date desc
  }

  /**
   * Determine data source priority
   */
  private static determineDataSource(
    staffRecord: any,
    salaryHistory: any[],
    employmentHistory: any[]
  ): DataSource {
    // Check for Employes sync data
    const hasEmployesSync = staffRecord?.employes_id && staffRecord?.last_sync_at;
    const hasEmployesSalary = salaryHistory.some(s => s.data_source === 'employes_sync');
    const hasEmployesHistory = employmentHistory.length > 0;

    if (hasEmployesSync || hasEmployesSalary || hasEmployesHistory) {
      console.log('[UnifiedEmploymentService] Data source: employes_sync');
      return 'employes_sync';
    }

    // Check for contract generation data
    const hasContractData = salaryHistory.some(s => s.data_source === 'contract_generation');
    if (hasContractData) {
      console.log('[UnifiedEmploymentService] Data source: contract_generated');
      return 'contract_generated';
    }

    // Check for manual entry
    const hasManualData = salaryHistory.some(s => s.data_source === 'manual');
    if (hasManualData || staffRecord) {
      console.log('[UnifiedEmploymentService] Data source: manual_entry');
      return 'manual_entry';
    }

    console.log('[UnifiedEmploymentService] Data source: unknown');
    return 'unknown';
  }

  /**
   * Assess data quality and confidence level
   */
  private static assessDataQuality(
    dataSource: DataSource,
    salaryHistory: any[],
    employmentHistory: any[]
  ): UnifiedEmploymentData['dataQuality'] {
    const hasEmployesSync = dataSource === 'employes_sync';
    const hasContractData = dataSource === 'contract_generated';
    const hasManualData = dataSource === 'manual_entry';
    
    const hasSalaryData = salaryHistory.length > 0;
    const hasHistoryData = employmentHistory.length > 0;

    let confidence: 'verified' | 'calculated' | 'manual' | 'incomplete';

    if (hasEmployesSync && hasSalaryData && hasHistoryData) {
      confidence = 'verified';
    } else if (hasContractData && hasSalaryData) {
      confidence = 'calculated';
    } else if (hasManualData) {
      confidence = 'manual';
    } else {
      confidence = 'incomplete';
    }

    return {
      hasEmployesSync,
      hasContractData,
      hasManualData,
      confidence,
    };
  }

  /**
   * Build minimal data from staff record when no contracts exist
   */
  private static buildFromStaffRecord(
    staffRecord: any,
    salaryHistory: any[],
    employmentHistory: any[]
  ): UnifiedEmploymentData {
    const dataSource = this.determineDataSource(staffRecord, salaryHistory, employmentHistory);
    
    return {
      current: {
        staffId: staffRecord.id,
        fullName: staffRecord.full_name,
        position: staffRecord.role,
        location: staffRecord.location,
        department: staffRecord.department,
        startDate: staffRecord.start_date || staffRecord.employment_start_date,
        endDate: staffRecord.employment_end_date,
        contractType: staffRecord.contract_type,
        dataSource,
        lastVerified: staffRecord.last_sync_at,
      },
      salaryHistory: salaryHistory.map(s => ({
        id: s.id,
        scale: s.scale,
        trede: s.trede,
        grossMonthly: s.gross_monthly,
        hourlyWage: s.hourly_wage,
        hoursPerWeek: s.hours_per_week,
        yearlyWage: s.yearly_wage,
        caoEffectiveDate: s.cao_effective_date,
        validFrom: s.valid_from,
        validTo: s.valid_to,
        dataSource: s.data_source,
      })),
      employmentHistory: employmentHistory.map(h => ({
        id: h.id,
        changeType: h.change_type,
        effectiveDate: h.effective_date,
        previousData: h.previous_data,
        newData: h.new_data,
        createdAt: h.created_at,
      })),
      contracts: [],
      dataQuality: this.assessDataQuality(dataSource, salaryHistory, employmentHistory),
    };
  }
}
