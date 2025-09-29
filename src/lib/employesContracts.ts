import { supabase } from "@/integrations/supabase/client";

// Dutch Labor Law Constants
export const DUTCH_LABOR_LAW = {
  MAX_CHAIN_CONTRACTS: 3,
  MAX_CHAIN_YEARS: 3,
  TERMINATION_NOTICE_DAYS: 30,
  IDEAL_NOTICE_DAYS: 90,
  REMINDER_NOTICE_DAYS: 60,
} as const;

export interface ContractPeriod {
  id: string;
  employeeId: string;
  employeeName: string;
  contractNumber: number;
  startDate: string;
  endDate: string | null;
  hoursPerWeek: number;
  daysPerWeek?: number;
  contractType: 'fulltime' | 'parttime';
  employmentType: 'fixed' | 'permanent';
  hourlyWage: number;
  monthlyWage: number;
  yearlyWage: number;
  isActive: boolean;
}

export interface ChainRuleStatus {
  totalContracts: number;
  totalEmploymentMonths: number;
  requiresPermanent: boolean;
  warningLevel: 'safe' | 'warning' | 'critical' | 'permanent_required';
  message: string;
}

export interface TerminationNotice {
  deadlineDate: string;
  daysUntilDeadline: number;
  notificationStatus: 'early' | 'ideal' | 'urgent' | 'critical' | 'overdue';
  penaltyDays: number;
  penaltyAmount: number;
  shouldNotify: boolean;
}

export interface EmploymentJourney {
  employeeId: string;
  employeeName: string;
  email: string;
  employesId: string | null;
  totalContracts: number;
  totalDurationMonths: number;
  firstStartDate: string;
  currentContract: ContractPeriod | null;
  contracts: ContractPeriod[];
  chainRuleStatus: ChainRuleStatus;
  terminationNotice: TerminationNotice | null;
  salaryProgression: SalaryChange[];
}

export interface SalaryChange {
  date: string;
  hourlyWage: number;
  monthlyWage: number;
  yearlyWage: number;
  increasePercent: number;
  reason: 'contract_start' | 'contract_renewal' | 'raise' | 'review';
}

export interface ComplianceAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'chain_rule' | 'termination_notice' | 'renewal_decision' | 'permanent_required';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  actionRequired: string;
  deadline: string | null;
  daysRemaining: number | null;
  contractEndDate: string | null;
}

/**
 * Calculate chain rule status based on contract history
 */
export function calculateChainRuleStatus(
  contracts: ContractPeriod[],
  firstStartDate: string
): ChainRuleStatus {
  const totalContracts = contracts.length;
  const now = new Date();
  const firstDate = new Date(firstStartDate);
  const totalMonths = Math.floor(
    (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // Check if already has permanent contract
  const hasPermanent = contracts.some(c => c.employmentType === 'permanent');
  if (hasPermanent) {
    return {
      totalContracts,
      totalEmploymentMonths: totalMonths,
      requiresPermanent: false,
      warningLevel: 'safe',
      message: 'Employee has permanent contract',
    };
  }

  // Check if permanent contract is required
  const contractsExceeded = totalContracts >= DUTCH_LABOR_LAW.MAX_CHAIN_CONTRACTS;
  const yearsExceeded = totalMonths >= DUTCH_LABOR_LAW.MAX_CHAIN_YEARS * 12;

  if (contractsExceeded || yearsExceeded) {
    return {
      totalContracts,
      totalEmploymentMonths: totalMonths,
      requiresPermanent: true,
      warningLevel: 'permanent_required',
      message: `🚨 Next contract MUST be permanent (${totalContracts} contracts / ${Math.floor(totalMonths / 12)} years)`,
    };
  }

  // Check if approaching limits
  const nearContractLimit = totalContracts === DUTCH_LABOR_LAW.MAX_CHAIN_CONTRACTS - 1;
  const nearYearLimit = totalMonths >= (DUTCH_LABOR_LAW.MAX_CHAIN_YEARS - 0.5) * 12;

  if (nearContractLimit || nearYearLimit) {
    return {
      totalContracts,
      totalEmploymentMonths: totalMonths,
      requiresPermanent: false,
      warningLevel: 'critical',
      message: `⚠️ Approaching limit: ${totalContracts}/${DUTCH_LABOR_LAW.MAX_CHAIN_CONTRACTS} contracts, ${Math.floor(totalMonths / 12)} years`,
    };
  }

  if (totalContracts === 1 && totalMonths > 18) {
    return {
      totalContracts,
      totalEmploymentMonths: totalMonths,
      requiresPermanent: false,
      warningLevel: 'warning',
      message: `Monitor: ${totalContracts} contract, ${Math.floor(totalMonths / 12)} years`,
    };
  }

  return {
    totalContracts,
    totalEmploymentMonths: totalMonths,
    requiresPermanent: false,
    warningLevel: 'safe',
    message: `Safe: ${totalContracts}/${DUTCH_LABOR_LAW.MAX_CHAIN_CONTRACTS} contracts`,
  };
}

/**
 * Calculate termination notice status
 */
export function calculateTerminationNotice(
  contractEndDate: string | null,
  dailyWage: number
): TerminationNotice | null {
  if (!contractEndDate) return null; // Permanent contract

  const now = new Date();
  const endDate = new Date(contractEndDate);
  const daysUntil = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const deadlineDate = new Date(endDate);
  deadlineDate.setDate(deadlineDate.getDate() - DUTCH_LABOR_LAW.TERMINATION_NOTICE_DAYS);

  const daysUntilDeadline = Math.floor(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  let notificationStatus: TerminationNotice['notificationStatus'] = 'early';
  let shouldNotify = false;

  if (daysUntilDeadline < 0) {
    notificationStatus = 'overdue';
    shouldNotify = true;
  } else if (daysUntilDeadline <= 0) {
    notificationStatus = 'critical';
    shouldNotify = true;
  } else if (daysUntilDeadline <= 30) {
    notificationStatus = 'urgent';
    shouldNotify = true;
  } else if (daysUntilDeadline <= 60) {
    notificationStatus = 'ideal';
    shouldNotify = true;
  }

  const penaltyDays = daysUntilDeadline < 0 ? Math.abs(daysUntilDeadline) : 0;
  const penaltyAmount = penaltyDays * dailyWage;

  return {
    deadlineDate: deadlineDate.toISOString().split('T')[0],
    daysUntilDeadline,
    notificationStatus,
    penaltyDays,
    penaltyAmount,
    shouldNotify,
  };
}

/**
 * Calculate salary progression from contract history
 */
export function calculateSalaryProgression(contracts: ContractPeriod[]): SalaryChange[] {
  const changes: SalaryChange[] = [];
  
  contracts.forEach((contract, index) => {
    const prevContract = index > 0 ? contracts[index - 1] : null;
    
    let increasePercent = 0;
    let reason: SalaryChange['reason'] = 'contract_start';
    
    if (prevContract) {
      increasePercent = 
        ((contract.hourlyWage - prevContract.hourlyWage) / prevContract.hourlyWage) * 100;
      reason = 'contract_renewal';
    }
    
    changes.push({
      date: contract.startDate,
      hourlyWage: contract.hourlyWage,
      monthlyWage: contract.monthlyWage,
      yearlyWage: contract.yearlyWage,
      increasePercent: Math.round(increasePercent * 100) / 100,
      reason,
    });
  });
  
  return changes;
}

/**
 * Extract contract periods from Employes.nl employee data
 */
export function extractContractPeriods(
  employesEmployee: any,
  lmsStaffId: string
): ContractPeriod[] {
  const contracts: ContractPeriod[] = [];
  
  if (!employesEmployee.employment) return contracts;
  
  const employment = employesEmployee.employment;
  const contract = employment.contract || {};
  const salary = employment.salary || {};
  
  // Create contract period from current employment data
  const contractPeriod: ContractPeriod = {
    id: `${lmsStaffId}-${employment.start_date}`,
    employeeId: lmsStaffId,
    employeeName: `${employesEmployee.first_name} ${employesEmployee.surname}`,
    contractNumber: 1, // Will be calculated based on history
    startDate: employment.start_date || contract.start_date,
    endDate: employment.end_date || contract.end_date || null,
    hoursPerWeek: contract.hours_per_week || 0,
    daysPerWeek: contract.days_per_week,
    contractType: contract.employee_type === 'fulltime' ? 'fulltime' : 'parttime',
    employmentType: employment.end_date ? 'fixed' : 'permanent',
    hourlyWage: salary.hour_wage || 0,
    monthlyWage: salary.month_wage || 0,
    yearlyWage: salary.yearly_wage || employesEmployee.yearly_wage || 0,
    isActive: true,
  };
  
  contracts.push(contractPeriod);
  
  return contracts;
}

/**
 * Build complete employment journey for an employee
 */
export async function buildEmploymentJourney(
  staffId: string
): Promise<EmploymentJourney | null> {
  // Fetch staff data
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .eq('id', staffId)
    .single();
    
  if (staffError || !staff) {
    console.error('Error fetching staff:', staffError);
    return null;
  }
  
  // For now, we'll create a mock contract from staff data
  // In a real implementation, we'd fetch from employes_contracts table
  const mockContract: ContractPeriod = {
    id: `${staffId}-current`,
    employeeId: staffId,
    employeeName: staff.full_name,
    contractNumber: 1,
    startDate: staff.employment_start_date || staff.start_date || new Date().toISOString(),
    endDate: staff.employment_end_date || null,
    hoursPerWeek: staff.working_hours_per_week || staff.hours_per_week || 40,
    contractType: (staff.working_hours_per_week || 40) >= 36 ? 'fulltime' : 'parttime',
    employmentType: staff.employment_end_date ? 'fixed' : 'permanent',
    hourlyWage: staff.hourly_wage || 0,
    monthlyWage: staff.salary_amount || 0,
    yearlyWage: (staff.salary_amount || 0) * 12,
    isActive: true,
  };
  
  const contracts = [mockContract];
  const firstStartDate = contracts[0].startDate;
  const currentContract = contracts.find(c => c.isActive) || null;
  
  const chainRuleStatus = calculateChainRuleStatus(contracts, firstStartDate);
  const terminationNotice = currentContract?.endDate 
    ? calculateTerminationNotice(currentContract.endDate, mockContract.hourlyWage / 8)
    : null;
  const salaryProgression = calculateSalaryProgression(contracts);
  
  const firstDate = new Date(firstStartDate);
  const now = new Date();
  const totalMonths = Math.floor(
    (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  return {
    employeeId: staffId,
    employeeName: staff.full_name,
    email: staff.email || '',
    employesId: staff.employes_id || null,
    totalContracts: contracts.length,
    totalDurationMonths: totalMonths,
    firstStartDate,
    currentContract,
    contracts,
    chainRuleStatus,
    terminationNotice,
    salaryProgression,
  };
}

/**
 * Generate compliance alerts for all employees
 */
export async function generateComplianceAlerts(): Promise<ComplianceAlert[]> {
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .eq('status', 'active');
    
  if (error || !staff) return [];
  
  const alerts: ComplianceAlert[] = [];
  
  for (const employee of staff) {
    const journey = await buildEmploymentJourney(employee.id);
    if (!journey) continue;
    
    // Chain rule alerts
    if (journey.chainRuleStatus.warningLevel === 'permanent_required') {
      alerts.push({
        id: `chain-${employee.id}`,
        employeeId: employee.id,
        employeeName: employee.full_name,
        type: 'permanent_required',
        severity: 'critical',
        message: journey.chainRuleStatus.message,
        actionRequired: 'Next contract MUST be permanent (vast contract)',
        deadline: journey.currentContract?.endDate || null,
        daysRemaining: journey.currentContract?.endDate 
          ? Math.floor((new Date(journey.currentContract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
        contractEndDate: journey.currentContract?.endDate || null,
      });
    } else if (journey.chainRuleStatus.warningLevel === 'critical') {
      alerts.push({
        id: `chain-warning-${employee.id}`,
        employeeId: employee.id,
        employeeName: employee.full_name,
        type: 'chain_rule',
        severity: 'warning',
        message: journey.chainRuleStatus.message,
        actionRequired: 'Monitor contract count and duration',
        deadline: journey.currentContract?.endDate || null,
        daysRemaining: journey.currentContract?.endDate 
          ? Math.floor((new Date(journey.currentContract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
        contractEndDate: journey.currentContract?.endDate || null,
      });
    }
    
    // Termination notice alerts
    if (journey.terminationNotice?.shouldNotify) {
      const notice = journey.terminationNotice;
      let severity: 'info' | 'warning' | 'critical' = 'info';
      let message = '';
      let action = '';
      
      if (notice.notificationStatus === 'overdue') {
        severity = 'critical';
        message = `⚠️ Termination deadline passed ${notice.penaltyDays} days ago`;
        action = `Penalty: €${notice.penaltyAmount.toFixed(2)} (€${(notice.penaltyAmount / notice.penaltyDays).toFixed(2)}/day)`;
      } else if (notice.notificationStatus === 'critical') {
        severity = 'critical';
        message = `🚨 Legal deadline TODAY - must notify employee`;
        action = 'Send termination or renewal notice immediately';
      } else if (notice.notificationStatus === 'urgent') {
        severity = 'warning';
        message = `⏰ ${notice.daysUntilDeadline} days until legal deadline`;
        action = 'Decide on contract renewal/termination';
      } else if (notice.notificationStatus === 'ideal') {
        severity = 'info';
        message = `📅 ${notice.daysUntilDeadline} days until termination deadline`;
        action = 'Ideal time to start renewal discussions';
      }
      
      alerts.push({
        id: `termination-${employee.id}`,
        employeeId: employee.id,
        employeeName: employee.full_name,
        type: 'termination_notice',
        severity,
        message,
        actionRequired: action,
        deadline: notice.deadlineDate,
        daysRemaining: notice.daysUntilDeadline,
        contractEndDate: journey.currentContract?.endDate || null,
      });
    }
  }
  
  return alerts.sort((a, b) => {
    // Sort by severity, then by days remaining
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (a.severity !== b.severity) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    if (a.daysRemaining === null) return 1;
    if (b.daysRemaining === null) return -1;
    return a.daysRemaining - b.daysRemaining;
  });
}
