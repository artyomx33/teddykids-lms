import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO } from "date-fns";

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
  // Computed fields
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
 * Fetch all contracts for a specific staff member
 */
export async function fetchStaffContracts(staffName: string): Promise<StaffContract[]> {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("employee_name", staffName)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch staff contracts: ${error.message}`);
  }

  return (data || []).map(contract => {
    const queryParams = contract.query_params || {};
    const startDate = queryParams.startDate;
    const endDate = queryParams.endDate;
    
    return {
      ...contract,
      start_date: startDate,
      end_date: endDate,
      salary_info: {
        scale: queryParams.scale,
        trede: queryParams.trede,
        grossMonthly: queryParams.grossMonthly,
      },
      days_until_start: startDate ? differenceInDays(parseISO(startDate), new Date()) : null,
      days_until_end: endDate ? differenceInDays(parseISO(endDate), new Date()) : null,
      position: queryParams.position,
      location: queryParams.location,
    };
  });
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