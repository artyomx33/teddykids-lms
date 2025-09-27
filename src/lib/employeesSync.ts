import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmployesEmployee {
  id: string;
  administration_id: string;
  employee_type_id: number;
  first_name: string;
  surname?: string;
  email: string;
  status: string;
  phone_number?: string;
  employee_number?: number;
  date_of_birth?: string;
  zipcode?: string;
  city?: string;
  street?: string;
  housenumber?: string;
  housenumber_suffix?: string;
  iban?: string;
  employment?: {
    start_date: string;
    end_date?: string;
    contract?: {
      start_date: string;
      end_date?: string;
      hours_per_week: number;
      employee_type: string;
    };
    salary?: {
      hour_wage: number;
      month_wage: number;
      yearly_wage: number;
    };
  };
}

export interface LMSStaff {
  id: string;
  full_name: string;
  email?: string;
  employes_id?: string;
  phone_number?: string;
  start_date?: string;
  birth_date?: string;
  employee_number?: number;
  hourly_wage?: number;
  hours_per_week?: number;
  contract_type?: string;
  zipcode?: string;
  city?: string;
  street_address?: string;
  house_number?: string;
  iban?: string;
  role?: string;
  location?: string;
  status?: string;
  last_sync_at?: string;
}

export interface EmployeeMatch {
  employes: EmployesEmployee;
  lms?: LMSStaff;
  matchType: 'exact' | 'similar' | 'new';
  confidence: number;
  syncRequired: boolean;
  conflicts?: string[];
  score?: number;
}

/**
 * Smart employee matching algorithm with weighted scoring (from superior old system)
 * Matches Employes employees with LMS staff using multiple strategies with confidence scoring
 */
export async function matchEmployees(employesEmployees: EmployesEmployee[]): Promise<EmployeeMatch[]> {
  // Fetch all LMS staff
  const { data: lmsStaff, error } = await supabase
    .from('staff')
    .select('*');
    
  if (error) {
    console.error('Failed to fetch LMS staff:', error);
    throw new Error('Failed to fetch LMS staff data');
  }

  const matches: EmployeeMatch[] = [];

  for (const employes of employesEmployees) {
    let bestMatch: LMSStaff | undefined;
    let matchType: 'exact' | 'similar' | 'new' = 'new';
    let maxScore = 0;
    let confidence = 0;

    // Try to match with each LMS staff member
    for (const staff of lmsStaff) {
      let score = 0;
      let currentMatchType: 'exact' | 'similar' | 'new' = 'similar';

      // Email matching (highest weight: 40 points)
      if (employes.email && staff.email) {
        if (employes.email.toLowerCase() === staff.email.toLowerCase()) {
          score += 40;
          currentMatchType = 'exact';
        }
      }

      // Name matching (30 points)
      const employesFullName = `${employes.first_name} ${employes.surname || ''}`.trim();
      if (staff.full_name) {
        const nameSimilarity = calculateNameSimilarity(employesFullName, staff.full_name);
        if (nameSimilarity >= 90) {
          score += 30;
          if (currentMatchType !== 'exact') currentMatchType = 'exact';
        } else if (nameSimilarity >= 70) {
          score += 20;
        } else if (nameSimilarity >= 50) {
          score += 10;
        }
      }

      // Phone matching (15 points)
      if (employes.phone_number && staff.phone_number) {
        const normalizedEmployesPhone = normalizePhoneNumber(employes.phone_number);
        const normalizedStaffPhone = normalizePhoneNumber(staff.phone_number);
        if (normalizedEmployesPhone === normalizedStaffPhone) {
          score += 15;
        }
      }

      // Employee number matching (15 points)
      if (employes.employee_number && staff.employee_number) {
        if (employes.employee_number === staff.employee_number) {
          score += 15;
        }
      }

      // Update best match if this is better
      if (score > maxScore && score >= 25) { // Minimum threshold
        maxScore = score;
        bestMatch = staff;
        matchType = currentMatchType;
        confidence = Math.min(Math.round((score / 100) * 100), 100);
      }
    }

    // If no good match found, it's a new employee
    if (!bestMatch) {
      matchType = 'new';
      confidence = 0;
    }

    // Determine if sync is required
    const syncRequired = bestMatch ? 
      isUpdateRequired(employes, bestMatch) : 
      true; // New employee needs to be created

    // Detect conflicts
    const conflicts = bestMatch ? 
      detectConflicts(employes, bestMatch) : 
      [];

    matches.push({
      employes: employes,
      lms: bestMatch,
      matchType: matchType,
      confidence: confidence,
      syncRequired: syncRequired,
      conflicts,
      score: maxScore
    });
  }

  return matches;
}

// Helper function to normalize phone numbers
function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, '').replace(/^31/, '0');
}

/**
 * Calculate name similarity using Levenshtein distance
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  if (n1 === n2) return 100;
  
  const distance = levenshteinDistance(n1, n2);
  const maxLength = Math.max(n1.length, n2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.round(similarity);
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Check if an employee record needs updating
 */
function isUpdateRequired(employes: EmployesEmployee, lmsStaff: LMSStaff): boolean {
  const employesData = transformEmployesDataForLMS(employes);
  
  return (
    lmsStaff.employes_id !== employes.id ||
    lmsStaff.email !== employes.email ||
    lmsStaff.phone_number !== employesData.phone_number ||
    lmsStaff.employee_number !== employesData.employee_number ||
    lmsStaff.hourly_wage !== employesData.hourly_wage ||
    lmsStaff.hours_per_week !== employesData.hours_per_week ||
    lmsStaff.zipcode !== employesData.zipcode ||
    lmsStaff.city !== employesData.city
  );
}

/**
 * Detect data conflicts between systems
 */
function detectConflicts(employes: EmployesEmployee, lmsStaff: LMSStaff): string[] {
  const conflicts: string[] = [];
  
  // Name conflict
  const employesFullName = `${employes.first_name} ${employes.surname || ''}`.trim();
  if (lmsStaff.full_name && employesFullName !== lmsStaff.full_name) {
    conflicts.push(`Name: LMS="${lmsStaff.full_name}" vs Employes="${employesFullName}"`);
  }
  
  // Email conflict
  if (lmsStaff.email && employes.email && lmsStaff.email !== employes.email) {
    conflicts.push(`Email: LMS="${lmsStaff.email}" vs Employes="${employes.email}"`);
  }
  
  return conflicts;
}

/**
 * Transform Employes employee data to LMS format
 */
function transformEmployesDataForLMS(employes: EmployesEmployee) {
  const fullName = `${employes.first_name} ${employes.surname || ''}`.trim();
  const streetAddress = employes.street && employes.housenumber ? 
    `${employes.street} ${employes.housenumber}${employes.housenumber_suffix || ''}` : 
    null;

  return {
    employes_id: employes.id,
    full_name: fullName,
    email: employes.email,
    phone_number: employes.phone_number,
    employee_number: employes.employee_number,
    birth_date: employes.date_of_birth ? employes.date_of_birth.split('T')[0] : null,
    start_date: employes.employment?.start_date ? employes.employment.start_date.split('T')[0] : null,
    hourly_wage: employes.employment?.salary?.hour_wage,
    hours_per_week: employes.employment?.contract?.hours_per_week,
    contract_type: employes.employment?.contract?.employee_type,
    zipcode: employes.zipcode,
    city: employes.city,
    street_address: streetAddress,
    house_number: employes.housenumber,
    iban: employes.iban,
    status: employes.status === 'active' ? 'active' : 'inactive',
    last_sync_at: new Date().toISOString()
  };
}

/**
 * Sync a single employee to LMS
 */
export async function syncEmployeeToLMS(match: EmployeeMatch): Promise<boolean> {
  try {
    const lmsData = transformEmployesDataForLMS(match.employes);
    
    if (match.lms) {
      // Update existing staff member
      const { error } = await supabase
        .from('staff')
        .update(lmsData)
        .eq('id', match.lms.id);
        
      if (error) throw error;
      
      toast.success(`Updated ${lmsData.full_name} in LMS`);
    } else {
      // Create new staff member
      const { error } = await supabase
        .from('staff')
        .insert([lmsData]);
        
      if (error) throw error;
      
      toast.success(`Added ${lmsData.full_name} to LMS`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to sync employee:', error);
    toast.error(`Failed to sync ${match.employes.first_name}`);
    return false;
  }
}

/**
 * Bulk sync multiple employees
 */
export async function bulkSyncEmployees(matches: EmployeeMatch[]): Promise<{
  success: number;
  failed: number;
  skipped: number;
}> {
  let success = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const match of matches) {
    if (!match.syncRequired) {
      skipped++;
      continue;
    }
    
    const result = await syncEmployeeToLMS(match);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // Small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { success, failed, skipped };
}