import { supabase } from "@/integrations/supabase/client";

export interface EmployesPersonalData {
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  birthDate?: string;
  nationality?: string;
  gender?: string;
  personalId?: string;
  iban?: string;
  address?: {
    street: string;
    houseNumber: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface EmployesEmploymentData {
  employmentId: string;
  status: string;
  startDate: string;
  endDate?: string;
  employmentType: string;
  workingDays?: string[];
  isPartTime: boolean;
  partTimeFactor?: number;
  hasCompanyAccess: boolean;
  outOfServiceCode?: string;
  outOfServiceReason?: string;
  pendingExitDate?: string;
}

export interface EmployesContractData {
  contractId: string;
  contractType: string | null;
  duration: string;
  startDate: string;
  endDate?: string;
  isSigned: boolean;
  isActive: boolean;
  status: string;
}

export interface EmployesWorkingHoursData {
  hoursPerWeek: number;
  daysPerWeek: number;
  startDate: string;
  endDate?: string;
  partTimeFactor?: number;
  workingDays?: string[];
}

export interface EmployesSalaryData {
  hourlyWage: number;
  grossMonthly?: number;
  monthlyWage?: number;
  yearlyWage?: number;
  startDate: string;
  endDate?: string;
  scale?: string;
  trede?: string;
  specialTaxPercentage?: number;
  wageTableCode?: string;
  taxReduction?: boolean;
}

export interface EmployesTaxData {
  ikvCode?: string;
  zvwCode?: string;
  hasWAO?: boolean;
  hasZW?: boolean;
  hasWW?: boolean;
  taxReduction?: boolean;
}

export interface EmployesProfileData {
  personal: EmployesPersonalData | null;
  employments: EmployesEmploymentData[];
  contracts: EmployesContractData[];
  workingHours: EmployesWorkingHoursData[];
  salaryHistory: EmployesSalaryData[];
  taxInfo: EmployesTaxData | null;
  rawDataAvailable: boolean;
  lastSyncedAt?: string;
}

/**
 * Fetch and parse all Employes.nl raw data for a staff member
 */
export async function fetchEmployesProfile(staffId: string): Promise<EmployesProfileData> {
  // Get the employes_id directly from the staff table
  const { data: staff } = await supabase
    .from('staff')
    .select('employes_id')
    .eq('id', staffId)
    .single();

  if (!staff?.employes_id) {
    return {
      personal: null,
      employments: [],
      contracts: [],
      workingHours: [],
      salaryHistory: [],
      taxInfo: null,
      rawDataAvailable: false,
    };
  }

  const employeeId = staff.employes_id;

  // Fetch all raw data for this employee
  const { data: rawData } = await supabase
    .from('employes_raw_data')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('is_latest', true);

  if (!rawData || rawData.length === 0) {
    return {
      personal: null,
      employments: [],
      contracts: [],
      workingHours: [],
      salaryHistory: [],
      taxInfo: null,
      rawDataAvailable: false,
    };
  }

  // Parse the data by endpoint
  const result: EmployesProfileData = {
    personal: null,
    employments: [],
    contracts: [],
    workingHours: [],
    salaryHistory: [],
    taxInfo: null,
    rawDataAvailable: true,
    lastSyncedAt: rawData[0]?.collected_at,
  };

  rawData.forEach((record) => {
    const apiResponse = record.api_response;
    const endpoint = record.endpoint;

    if (endpoint === '/employee' && apiResponse) {
      result.personal = parsePersonalData(apiResponse);
      result.taxInfo = parseTaxData(apiResponse);
    } else if (endpoint === '/employments' && apiResponse?.employments) {
      const employments = Array.isArray(apiResponse.employments) 
        ? apiResponse.employments 
        : [apiResponse.employments];
      
      employments.forEach((emp: any) => {
        result.employments.push(parseEmploymentData(emp));
        
        if (emp.contract) {
          result.contracts.push(parseContractData(emp.contract));
        }
        
        if (emp.hoursPerWeek || emp.hours) {
          result.workingHours.push(parseWorkingHoursData(emp));
        }
        
        if (emp.hourlyWage || emp.monthlyWage || emp.yearlyWage) {
          result.salaryHistory.push(parseSalaryData(emp));
        }
      });
    }
  });

  // Sort by date (most recent first)
  result.employments.sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  result.contracts.sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  result.workingHours.sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  result.salaryHistory.sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return result;
}

function parsePersonalData(data: any): EmployesPersonalData {
  return {
    employeeId: data.id || '',
    firstName: data.firstName || '',
    middleName: data.middleName,
    lastName: data.lastName || '',
    email: data.email || data.emailAddress,
    phone: data.phone || data.phoneNumber,
    mobile: data.mobile || data.mobileNumber,
    birthDate: data.birthDate || data.dateOfBirth,
    nationality: data.nationality,
    gender: data.gender,
    personalId: data.personalId || data.bsn,
    iban: data.iban,
    address: data.address ? {
      street: data.address.street || '',
      houseNumber: data.address.houseNumber || '',
      city: data.address.city || '',
      zipCode: data.address.zipCode || data.address.postalCode || '',
      country: data.address.country || 'NL',
    } : undefined,
  };
}

function parseEmploymentData(emp: any): EmployesEmploymentData {
  return {
    employmentId: emp.id || emp.employmentId || '',
    status: emp.status || 'Unknown',
    startDate: emp.startDate || emp.employmentStartDate || '',
    endDate: emp.endDate || emp.employmentEndDate,
    employmentType: emp.employmentType || emp.type || '',
    workingDays: emp.workingDays,
    isPartTime: emp.isPartTime || false,
    partTimeFactor: emp.partTimeFactor,
    hasCompanyAccess: emp.hasCompanyAccess || false,
    outOfServiceCode: emp.outOfServiceCode,
    outOfServiceReason: emp.outOfServiceReason,
    pendingExitDate: emp.pendingExitDate,
  };
}

function parseContractData(contract: any): EmployesContractData {
  return {
    contractId: contract.id || contract.contractId || '',
    contractType: contract.contractType || contract.type || null,
    duration: contract.duration || 'Unknown',
    startDate: contract.startDate || '',
    endDate: contract.endDate,
    isSigned: contract.isSigned || false,
    isActive: contract.isActive || contract.status === 'Active',
    status: contract.status || 'Unknown',
  };
}

function parseWorkingHoursData(emp: any): EmployesWorkingHoursData {
  return {
    hoursPerWeek: emp.hoursPerWeek || emp.hours || 0,
    daysPerWeek: emp.daysPerWeek || 0,
    startDate: emp.startDate || emp.hoursStartDate || '',
    endDate: emp.endDate || emp.hoursEndDate,
    partTimeFactor: emp.partTimeFactor,
    workingDays: emp.workingDays,
  };
}

function parseSalaryData(emp: any): EmployesSalaryData {
  return {
    hourlyWage: emp.hourlyWage || 0,
    grossMonthly: emp.grossMonthly || emp.grossMonthlySalary,
    monthlyWage: emp.monthlyWage || emp.grossMonthlySalary,
    yearlyWage: emp.yearlyWage || emp.grossYearlySalary,
    startDate: emp.startDate || emp.salaryStartDate || '',
    endDate: emp.endDate || emp.salaryEndDate,
    scale: emp.scale || emp.salaryScale,
    trede: emp.trede || emp.salaryStep,
    specialTaxPercentage: emp.specialTaxPercentage,
    wageTableCode: emp.wageTableCode,
    taxReduction: emp.taxReduction,
  };
}

function parseTaxData(data: any): EmployesTaxData {
  return {
    ikvCode: data.ikvCode,
    zvwCode: data.zvwCode,
    hasWAO: data.hasWAO,
    hasZW: data.hasZW,
    hasWW: data.hasWW,
    taxReduction: data.taxReduction,
  };
}

/**
 * Detect if employee is an intern based on salary data
 */
export function isIntern(salaryData: EmployesSalaryData[]): boolean {
  if (salaryData.length === 0) return false;
  const latestSalary = salaryData[0];
  return (latestSalary.hourlyWage || 0) < 3;
}
