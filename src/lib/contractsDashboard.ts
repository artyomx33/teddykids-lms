// src/lib/contractsDashboard.ts
import { supabase } from "@/integrations/supabase/client";

export type EnrichedContract = {
  id: string;
  employee_name: string | null;
  manager: string | null;
  department: string | null;
  status: string;
  created_at: string;
  signed_at: string | null;
  pdf_path: string | null;
  end_date: string | null;   // ISO
  birth_date: string | null; // ISO
  manager_key?: string;
  position_key?: string;
};

export type KpiStats = {
  createdThisYear: number;
  endedThisYear: number;
  net: number;
  byManager: Record<string, { signed: number; ended: number }>;
  topSigned: string | null;
  topEnded: string | null;
};

/* ------------------------------------------------------------------ */
/* Fetch helpers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Fetches contracts expiring within the specified number of days
 * @param days Number of days to look ahead (default: 90)
 * @returns Array of contracts expiring within the specified period
 */
export async function fetchExpiringContracts(days = 90): Promise<EnrichedContract[]> {
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  
  const { data, error } = await supabase
    .from("employes_current_state")
    .select("*")
    .gte("contract_end_date", today)
    .lte("contract_end_date", future)
    .order("contract_end_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EnrichedContract[];
}

/**
 * Fetches contracts with birthdays coming up within the specified number of days
 * @param days Number of days to look ahead (default: 14)
 * @returns Array of contracts with upcoming birthdays
 */
export async function fetchUpcomingBirthdays(days = 14): Promise<EnrichedContract[]> {
  const today = new Date();
  const max = new Date(Date.now() + days * 86_400_000);

  const { data, error } = await supabase
    .from("employes_current_state")
    .select("*")
    .not("date_of_birth", "is", null);

  if (error) throw error;

  // Filter for birthdays in the next 'days' window, accounting for year wrapping
  const inWindow = (data ?? []).filter((row: any) => {
    if (!row.date_of_birth) return false;
    
    const birthDate = new Date(row.date_of_birth);
    // Create date for this year's birthday
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    
    // If birthday already passed this year, look at next year
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
    }
    
    return thisYearBirthday >= today && thisYearBirthday <= max;
  });

  // Sort by upcoming date
  return inWindow.sort((a: any, b: any) => {
    const dateA = new Date(a.date_of_birth);
    const dateB = new Date(b.date_of_birth);
    
    const thisYearA = new Date(
      today.getFullYear(),
      dateA.getMonth(),
      dateA.getDate()
    );
    const thisYearB = new Date(
      today.getFullYear(),
      dateB.getMonth(),
      dateB.getDate()
    );
    
    if (thisYearA < today) thisYearA.setFullYear(thisYearA.getFullYear() + 1);
    if (thisYearB < today) thisYearB.setFullYear(thisYearB.getFullYear() + 1);
    
    return thisYearA.getTime() - thisYearB.getTime();
  }) as EnrichedContract[];
}

/**
 * Fetches KPI statistics for contracts
 * @param year Year to calculate stats for (default: current year)
 * @returns Object containing KPI statistics
 */
export async function fetchKpiStats(year = new Date().getFullYear()): Promise<KpiStats> {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const { data, error } = await supabase
    .from("employes_current_state")
    .select("status, manager, created_at, end_date, manager_key");

  if (error) throw error;
  const rows = (data ?? []) as EnrichedContract[];

  const createdThisYear = rows.filter(r => 
    r.created_at >= yearStart && r.created_at <= yearEnd
  ).length;
  
  const endedThisYear = rows.filter(r => 
    r.end_date && r.end_date >= yearStart && r.end_date <= yearEnd
  ).length;
  
  const net = createdThisYear - endedThisYear;

  // Group by manager
  const byManager: Record<string, { signed: number; ended: number }> = {};
  
  for (const r of rows) {
    const key = r.manager_key || (r.manager ? r.manager.toLowerCase() : "unknown");
    
    if (!byManager[key]) {
      byManager[key] = { signed: 0, ended: 0 };
    }
    
    if (r.created_at >= yearStart && r.created_at <= yearEnd) {
      byManager[key].signed++;
    }
    
    if (r.end_date && r.end_date >= yearStart && r.end_date <= yearEnd) {
      byManager[key].ended++;
    }
  }

  // Find top managers
  const managerEntries = Object.entries(byManager);
  const topSigned = managerEntries.length > 0 
    ? managerEntries.sort((a, b) => b[1].signed - a[1].signed)[0]?.[0] 
    : null;
    
  const topEnded = managerEntries.length > 0 
    ? managerEntries.sort((a, b) => b[1].ended - a[1].ended)[0]?.[0] 
    : null;

  return { 
    createdThisYear, 
    endedThisYear, 
    net, 
    byManager, 
    topSigned, 
    topEnded 
  };
}

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */

/**
 * Calculates days until a given date
 * @param dateIso ISO date string
 * @returns Number of days until the date, or null if date is invalid
 */
export function daysUntil(dateIso?: string | null): number | null {
  if (!dateIso) return null;
  
  const targetDate = new Date(dateIso);
  const today = new Date();
  
  // Reset time components to compare dates only
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffMs = targetDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determines the badge variant based on days remaining
 * @param days Number of days remaining
 * @returns Badge variant: "green" | "orange" | "red" | "muted"
 */
export function countdownBadgeVariant(
  days: number | null
): "green" | "orange" | "red" | "muted" {
  if (days === null) return "muted";
  if (days > 60) return "green";
  if (days > 35) return "orange";
  return "red";
}

/**
 * Formats a date for display
 * @param dateIso ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateIso?: string | null): string {
  if (!dateIso) return "—";
  
  return new Date(dateIso).toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Formats a birthday date (month and day only)
 * @param dateIso ISO date string
 * @returns Formatted month and day
 */
export function formatBirthday(dateIso?: string | null): string {
  if (!dateIso) return "—";
  
  return new Date(dateIso).toLocaleDateString("nl-NL", {
    month: "short",
    day: "numeric"
  });
}
