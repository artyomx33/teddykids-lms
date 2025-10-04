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
    personalId: data.personal_identification_number,
    iban: data.iban,
    address: (data.street || data.city || data.zipcode) ? {
      street: data.street || '',
      houseNumber: data.housenumber || '',
      city: data.city || '',
      zipCode: data.zipcode || '',
      country: 'NL',
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

/**
 * Parse raw API response data from employes_raw_data table
 * This is for the /employee endpoint data
 */
export function parseRawEmployeeData(apiResponse: any) {
  // Handle the raw API response structure
  const data = apiResponse || {};

  // Try to extract name from various possible field names (including Dutch)
  let firstName = data.firstName || data.firstname || data.first_name ||
                  data.voornaam || data.voorNaam || data.given_name || '';

  let lastName = data.lastName || data.lastname || data.last_name ||
                 data.achternaam || data.achterNaam || data.surname ||
                 data.family_name || '';

  // If we have a full name field, try to split it
  if (!firstName && !lastName) {
    const fullName = data.name || data.fullName || data.full_name ||
                     data.naam || data.volledigeNaam || '';
    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      } else if (parts.length === 1) {
        firstName = parts[0];
      }
    }
  }

  return {
    firstName,
    lastName,
    birthDate: data.birthDate || data.birth_date || data.dateOfBirth || data.date_of_birth ||
               data.geboortedatum || data.geboorteDatum || '',
    bsn: data.personal_identification_number || data.bsn || data.BSN || '',
    streetAddress: data.street || data.straat || data.street_address || '',
    houseNumber: data.housenumber || data.house_number || data.houseNumber ||
                 data.huisnummer || data.huisNummer || '',
    zipcode: data.zipcode || data.zip_code || data.zipCode || data.postcode || '',
    city: data.city || data.plaats || data.woonplaats || '',
    phone: data.phone || data.phoneNumber || data.phone_number ||
           data.mobile || data.mobileNumber || data.mobile_number ||
           data.telefoon || data.telefoonnummer || data.mobiel || '',
    email: data.email || data.emailAddress || data.email_address ||
           data.emailadres || data.emailAdres || '',
    position: data.position || data.jobTitle || data.job_title ||
              data.function || data.functie || data.role || '',
    startDate: data.startDate || data.start_date || data.employmentStartDate ||
               data.employment_start_date || data.startdatum || '',
    endDate: data.endDate || data.end_date || data.employmentEndDate ||
             data.employment_end_date || data.einddatum || '',
    manager: data.manager || data.supervisor || data.leidinggevende || '',
    hoursPerWeek: data.hoursPerWeek || data.hours_per_week || data.hours ||
                  data.urenPerWeek || data.uren_per_week || 36,
  };
}

export function parseEmployeeProfile(responseData: any) {
  const personal = responseData?.personal || {};
  const employment = responseData?.employments?.[0] || {};
  const address = personal?.address || {};

  return {
    firstName: personal?.firstName || '',
    lastName: personal?.lastName || '',
    birthDate: personal?.birthDate || '',
    bsn: personal?.bsn || '',
    streetAddress: address?.street || '',
    houseNumber: address?.houseNumber || '',
    zipcode: address?.zipcode || '',
    city: address?.city || '',
    phone: personal?.phone || '',
    email: personal?.email || '',
    position: employment?.position || '',
    startDate: employment?.startDate || '',
    endDate: employment?.endDate || '',
    manager: employment?.manager || '',
  };
}
