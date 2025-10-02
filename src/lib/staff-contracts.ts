import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO } from "date-fns";
import { buildEmploymentJourney } from "./employesContracts";

export type StaffContract = {
  id: string;
  employee_name: string;
  manager: string | null;
  status: string;
  contract_type: string | null;
  department: string | null;
  query_params: any;
  created_at: string;
  signed_at: string | null;
  pdf_path: string | null;
  start_date?: string | null;
  end_date?: string | null;
  salary_info?: {
    scale?: string;
    trede?: string;
    grossMonthly?: number;
  };
  days_until_start?: number;
  days_until_end?: number;
  position?: string;
  location?: string;
};

export type UserRole = 'admin' | 'manager' | 'staff';

/**
 * Fetch all contracts for a specific staff member from employes_raw_data
 * Single source of truth - no fallbacks
 */
export async function fetchStaffContracts(staffName: string): Promise<StaffContract[]> {
  const { data: staffData } = await supabase
    .from("staff")
    .select("id")
    .eq("full_name", staffName)
    .single();

  if (!staffData) {
    return [];
  }

  const journey = await buildEmploymentJourney(staffData.id);
  if (!journey) {
    return [];
  }

  return journey.contracts.map((contract, index) => ({
    id: `employes-${contract.startDate}-${index}`,
    employee_name: staffName,
    manager: null,
    status: contract.isActive ? 'active' : 'expired',
    contract_type: contract.employmentType === 'permanent' ? 'Permanent' : 'Fixed-term',
    department: null,
    query_params: {},
    created_at: contract.startDate,
    signed_at: contract.startDate,
    pdf_path: null,
    start_date: contract.startDate,
    end_date: contract.endDate,
    salary_info: {
      grossMonthly: contract.monthlyWage,
    },
    days_until_start: differenceInDays(parseISO(contract.startDate), new Date()),
    days_until_end: contract.endDate ? differenceInDays(parseISO(contract.endDate), new Date()) : null,
    position: undefined,
    location: undefined,
  }));
}

/**
 * Check if user can see salary information based on role and relationships
 */
export function canViewSalaryInfo(
  userRole: UserRole,
  isOwnContract: boolean,
  isUserManager: boolean
): boolean {
  // Admin can see all salary info
  if (userRole === 'admin') return true;
  
  // Staff can only see their own contracts (without salary)
  if (userRole === 'staff') return false;
  
  // Manager can see contracts for their staff but not salary info
  if (userRole === 'manager' && isUserManager) return false;
  
  return false;
}

/**
 * Check if user can create contracts for this staff member
 */
export function canCreateContract(
  userRole: UserRole,
  isUserManager: boolean
): boolean {
  return userRole === 'admin' || (userRole === 'manager' && isUserManager);
}

/**
 * Get contract status color for UI
 */
export function getContractStatusColor(status: string, daysUntilEnd?: number | null): string {
  switch (status.toLowerCase()) {
    case 'active':
      if (daysUntilEnd !== null && daysUntilEnd !== undefined && daysUntilEnd <= 30) {
        return 'text-orange-600 bg-orange-50';
      }
      return 'text-green-600 bg-green-50';
    case 'draft':
      return 'text-blue-600 bg-blue-50';
    case 'expired':
      return 'text-red-600 bg-red-50';
    case 'terminated':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return '';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}