/**
 * Enhanced Employes Data Service - 2.0
 *
 * This service integrates with the complete database that Lovable extracted,
 * providing real salary progression and contract data from Employes.nl
 */

import { supabase } from "@/integrations/supabase/client";
import { SalaryChange, EmploymentJourney, ContractPeriod } from "./employesContracts";

export interface RealEmployesData {
  staffId: string;
  employesEmployeeId: string | null;
  fullName: string;
  email: string;
  employeeNumber: number;
  salaryHistory: RealSalaryRecord[];
  contracts: RealContractRecord[];
  employmentJourney: EmploymentJourney | null;
}

export interface RealSalaryRecord {
  id: string;
  staffId: string;
  grossMonthly: number;
  hourlyWage: number | null;
  hoursPerWeek: number;
  validFrom: string;
  validTo: string | null;
  scale: string | null;
  trede: string | null;
  yearlyWage: number | null;
  caoEffectiveDate: string;
  dataSource: string | null;
}

export interface RealContractRecord {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string | null;
  contractType: string;
  hoursPerWeek: number;
  status: 'active' | 'inactive' | 'draft' | 'pending';
  position: string | null;
  location: string | null;
}

/**
 * Get complete employment data for a staff member using real Lovable data
 */
export async function getRealEmploymentData(staffId: string): Promise<RealEmployesData | null> {
  try {
    // Get staff basic info
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, full_name, email')
      .eq('id', staffId)
      .single();

    if (staffError || !staff) {
      console.error('Failed to fetch staff:', staffError);
      return null;
    }

    // Get salary history from cao_salary_history (real Lovable data)
    const { data: salaryData, error: salaryError } = await supabase
      .from('cao_salary_history')
      .select('*')
      .eq('staff_id', staffId)
      .order('valid_from', { ascending: true });

    if (salaryError) {
      console.error('Failed to fetch salary history:', salaryError);
    }

    // Get contracts (when available)
    const { data: contractData, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('staff_id', staffId)
      .order('start_date', { ascending: true });

    if (contractError) {
      console.error('Failed to fetch contracts:', contractError);
    }

    // Transform salary data
    const salaryHistory: RealSalaryRecord[] = (salaryData || []).map(record => ({
      id: record.id,
      staffId: record.staff_id,
      grossMonthly: record.gross_monthly,
      hourlyWage: record.hourly_wage,
      hoursPerWeek: record.hours_per_week,
      validFrom: record.valid_from,
      validTo: record.valid_to,
      scale: record.scale,
      trede: record.trede,
      yearlyWage: record.yearly_wage,
      caoEffectiveDate: record.cao_effective_date,
      dataSource: record.data_source,
    }));

    // Transform contract data
    const contracts: RealContractRecord[] = (contractData || []).map(contract => ({
      id: contract.id,
      staffId: contract.staff_id,
      startDate: contract.start_date,
      endDate: contract.end_date,
      contractType: contract.contract_type || 'unknown',
      hoursPerWeek: contract.hours_per_week || 0,
      status: contract.status || 'draft',
      position: contract.position,
      location: contract.location,
    }));

    // Build employment journey from real data
    const employmentJourney = buildRealEmploymentJourney(
      staff,
      salaryHistory,
      contracts
    );

    return {
      staffId: staff.id,
      employesEmployeeId: null, // Will be filled when we have employes mapping
      fullName: staff.full_name,
      email: staff.email,
      employeeNumber: 0, // Will be filled when we have employes mapping
      salaryHistory,
      contracts,
      employmentJourney,
    };

  } catch (error) {
    console.error('Error fetching real employment data:', error);
    return null;
  }
}

/**
 * Build employment journey from real Lovable data
 */
function buildRealEmploymentJourney(
  staff: any,
  salaryHistory: RealSalaryRecord[],
  contracts: RealContractRecord[]
): EmploymentJourney | null {

  if (salaryHistory.length === 0 && contracts.length === 0) {
    return null;
  }

  // Build salary progression from real data
  const salaryProgression: SalaryChange[] = salaryHistory.map((record, index) => {
    const previousRecord = index > 0 ? salaryHistory[index - 1] : null;

    let increasePercent = 0;
    if (previousRecord && previousRecord.hourlyWage && record.hourlyWage) {
      increasePercent = ((record.hourlyWage - previousRecord.hourlyWage) / previousRecord.hourlyWage) * 100;
    }

    // Calculate monthly and yearly wages if missing
    const hourlyWage = record.hourlyWage || (record.grossMonthly / (record.hoursPerWeek * 4.33));
    const yearlyWage = record.yearlyWage || (record.grossMonthly * 12);

    return {
      date: record.validFrom,
      hourlyWage,
      monthlyWage: record.grossMonthly,
      yearlyWage,
      increasePercent,
      reason: index === 0 ? 'contract_start' : 'raise' as const,
    };
  });

  // Build contract periods
  const contractPeriods: ContractPeriod[] = contracts.map((contract, index) => ({
    id: contract.id,
    employeeId: staff.id,
    employeeName: staff.full_name,
    contractNumber: index + 1,
    startDate: contract.startDate,
    endDate: contract.endDate,
    hoursPerWeek: contract.hoursPerWeek,
    contractType: contract.hoursPerWeek >= 36 ? 'fulltime' : 'parttime',
    employmentType: contract.endDate ? 'fixed' : 'permanent',
    // Use salary data if available, otherwise estimates
    hourlyWage: salaryHistory.find(s => s.validFrom <= contract.startDate)?.hourlyWage || 0,
    monthlyWage: salaryHistory.find(s => s.validFrom <= contract.startDate)?.grossMonthly || 0,
    yearlyWage: salaryHistory.find(s => s.validFrom <= contract.startDate)?.yearlyWage || 0,
    isActive: contract.status === 'active',
  }));

  const firstContract = contractPeriods[0];
  const currentContract = contractPeriods.find(c => c.isActive) || contractPeriods[contractPeriods.length - 1];

  return {
    employeeId: staff.id,
    employeeName: staff.full_name,
    email: staff.email,
    employesId: null,
    totalContracts: contractPeriods.length,
    totalDurationMonths: 0, // Calculate from contract periods
    firstStartDate: firstContract?.startDate || salaryHistory[0]?.validFrom || '',
    currentContract,
    contracts: contractPeriods,
    chainRuleStatus: {
      totalContracts: contractPeriods.length,
      totalEmploymentMonths: 0,
      requiresPermanent: false,
      warningLevel: 'safe',
      message: 'Analysis available when contracts are loaded',
    },
    terminationNotice: null,
    salaryProgression,
  };
}

/**
 * Get all staff with employment data for dashboard views
 */
export async function getAllStaffWithEmploymentData(): Promise<RealEmployesData[]> {
  try {
    // Get all staff
    const { data: allStaff, error: staffError } = await supabase
      .from('staff')
      .select('id, full_name, email, status')
      .eq('status', 'active')
      .order('full_name');

    if (staffError || !allStaff) {
      console.error('Failed to fetch staff list:', staffError);
      return [];
    }

    // Get employment data for each staff member
    const employmentData = await Promise.all(
      allStaff.map(staff => getRealEmploymentData(staff.id))
    );

    return employmentData.filter(data => data !== null) as RealEmployesData[];

  } catch (error) {
    console.error('Error fetching all staff employment data:', error);
    return [];
  }
}

/**
 * Preview data structure for Adéla based on Lovable's findings
 * This shows what the data will look like when properly integrated
 */
export function getAdelaPreviewData(): RealEmployesData {
  return {
    staffId: 'preview-adela',
    employesEmployeeId: '93',
    fullName: 'Adéla Jarošová',
    email: 'adelkajarosova@seznam.cz',
    employeeNumber: 93,
    salaryHistory: [
      {
        id: 'sal-1',
        staffId: 'preview-adela',
        grossMonthly: 2539,
        hourlyWage: 16.28,
        hoursPerWeek: 30,
        validFrom: '2024-09-01',
        validTo: '2024-11-30',
        scale: null,
        trede: null,
        yearlyWage: 30468,
        caoEffectiveDate: '2024-09-01',
        dataSource: 'employes_api',
      },
      {
        id: 'sal-2',
        staffId: 'preview-adela',
        grossMonthly: 2709,
        hourlyWage: 17.37,
        hoursPerWeek: 30,
        validFrom: '2024-12-01',
        validTo: '2025-06-18',
        scale: null,
        trede: null,
        yearlyWage: 32508,
        caoEffectiveDate: '2024-12-01',
        dataSource: 'employes_api',
      },
      {
        id: 'sal-3',
        staffId: 'preview-adela',
        grossMonthly: 2777,
        hourlyWage: 17.80,
        hoursPerWeek: 30,
        validFrom: '2025-06-19',
        validTo: '2025-06-30',
        scale: null,
        trede: null,
        yearlyWage: 33324,
        caoEffectiveDate: '2025-06-19',
        dataSource: 'employes_api',
      },
      {
        id: 'sal-4',
        staffId: 'preview-adela',
        grossMonthly: 2846,
        hourlyWage: 18.24,
        hoursPerWeek: 30,
        validFrom: '2025-07-01',
        validTo: null,
        scale: null,
        trede: null,
        yearlyWage: 34152,
        caoEffectiveDate: '2025-07-01',
        dataSource: 'employes_api',
      },
    ],
    contracts: [
      {
        id: 'contract-1',
        staffId: 'preview-adela',
        startDate: '2024-09-01',
        endDate: '2024-11-19',
        contractType: 'fixed',
        hoursPerWeek: 30,
        status: 'inactive',
        position: 'Pedagogisch medewerker',
        location: 'TeddyKids',
      },
      {
        id: 'contract-2',
        staffId: 'preview-adela',
        startDate: '2024-11-20',
        endDate: '2025-11-09',
        contractType: 'fixed',
        hoursPerWeek: 30,
        status: 'active',
        position: 'Pedagogisch medewerker',
        location: 'TeddyKids',
      },
    ],
    employmentJourney: null, // Will be built dynamically
  };
}