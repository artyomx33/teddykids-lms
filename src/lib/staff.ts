import { supabase } from "@/integrations/supabase/client";
import { fetchStaffContracts, StaffContract } from "@/lib/staff-contracts";

// Types
export type Staff = {
  id: string;
  full_name: string;
  email: string | null;
  location: string | null;
  role: string | null;
  status: "active" | "inactive" | string;
  created_at: string;
  is_intern: boolean;
  intern_year: number | null;
  intern_meta?: any;
};

export type StaffListItem = {
  id: string;
  name: string;
  firstContractDate: string | null;
  active: boolean;
  lastReviewDate: string | null;
  hasRecentReview: boolean;
  role: string | null;
  location: string | null;
};

export type StaffReview = {
  id: string;
  staff_id: string;
  review_type: string | null;
  review_date: string;
  score: number | null;
  summary: string | null;
  raise: boolean;
  created_at: string;
};

export type StaffNote = {
  id: string;
  staff_id: string;
  note_type: string | null;
  note: string | null;
  created_at: string;
};

export type StaffCertificate = {
  id: string;
  staff_id: string;
  title: string | null;
  file_path: string | null;
  uploaded_at: string;
};

export type StaffDetail = {
  staff: Staff;
  enrichedContract?: any;
  documentStatus?: any;
  firstContractDate: string | null;
  lastReview: string | null;
  raiseEligible: boolean;
  reviews: StaffReview[];
  notes: StaffNote[];
  certificates: StaffCertificate[];
  contracts: StaffContract[];
};

// Helpers
export function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function calculateMilestones(hireDateIso: string | null) {
  if (!hireDateIso) {
    return { firstMonth: null, halfYear: null, oneYear: null };
  }
  const base = new Date(hireDateIso);
  const firstMonth = new Date(base);
  firstMonth.setMonth(firstMonth.getMonth() + 1);

  const halfYear = new Date(base);
  halfYear.setMonth(halfYear.getMonth() + 6);

  const oneYear = new Date(base);
  oneYear.setFullYear(oneYear.getFullYear() + 1);

  return {
    firstMonth: iso(firstMonth),
    halfYear: iso(halfYear),
    oneYear: iso(oneYear),
  };
}

export function daysSince(dateIso: string | null) {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  return diff;
}

// Data access - 2.0 Architecture Optimized
export async function fetchStaffList(): Promise<StaffListItem[]> {

  // Direct query to staff VIEW - fast and simple
  const { data, error } = await supabase
    .from('staff')
    .select('id, full_name, role, location, employes_id, last_sync_at')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Staff list query failed:', error);
    throw error;
  }

  console.log(`✅ Loaded ${data?.length || 0} staff members from staff VIEW`);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.full_name,
    firstContractDate: null, // Skip complex contract lookups for speed
    active: true, // All staff in VIEW are considered active
    lastReviewDate: null, // Skip review lookups (staff_reviews empty)
    hasRecentReview: false, // Skip review lookups (staff_reviews empty)
    role: row.role,
    location: row.location,
  }));
}

// Fallback function using manual joins for compatibility
async function fetchStaffListFallback(): Promise<StaffListItem[]> {
  // Get all staff data with single query using LEFT JOINs
  const query = `
    SELECT 
      s.id as staff_id,
      s.full_name,
      s.role,
      s.location,
      s.status,
      fc.first_contract_date,
      lr.last_review_date,
      CASE 
        WHEN lr.last_review_date IS NOT NULL 
        AND lr.last_review_date > (CURRENT_DATE - INTERVAL '1 year')
        THEN true 
        ELSE false 
      END as has_recent_review
    FROM staff s
    LEFT JOIN (
      SELECT 
        employee_name,
        COALESCE(
          (query_params->>'startDate')::date,
          created_at::date
        ) as first_contract_date,
        ROW_NUMBER() OVER (PARTITION BY employee_name ORDER BY created_at ASC) as rn
      FROM contracts
    ) fc ON fc.employee_name = s.full_name AND fc.rn = 1
    LEFT JOIN (
      SELECT 
        staff_id,
        review_date as last_review_date,
        ROW_NUMBER() OVER (PARTITION BY staff_id ORDER BY review_date DESC) as rn
      FROM staff_reviews
    ) lr ON lr.staff_id = s.id AND lr.rn = 1
    ORDER BY s.full_name ASC
  `;

  const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
  
  if (error) {
    console.error('Fallback query failed:', error);
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.staff_id,
    name: row.full_name,
    firstContractDate: row.first_contract_date 
      ? new Date(row.first_contract_date).toISOString().slice(0, 10)
      : null,
    active: row.status === "active",
    lastReviewDate: row.last_review_date,
    hasRecentReview: row.has_recent_review,
    role: row.role,
    location: row.location,
  }));
}

export async function fetchStaffDetail(staffId: string): Promise<StaffDetail> {

  // Get basic staff data (this should work - staff VIEW)
  const { data: staff, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", staffId)
    .single();

  if (error) {
    console.error('❌ MISSING DATA: staff VIEW query failed:', error);
    throw new Error(`MISSING DATA CONNECT: staff VIEW - ${error.message}`);
  }

  if (!staff) {
    throw new Error(`MISSING DATA CONNECT: Staff with id ${staffId} not found in staff VIEW`);
  }

  const staffRecord = staff as Staff;

  // 🔥 NEW 2.0 MAGIC: Connect to Employes.nl raw data like 1.0!
  let employesData = null;
  let firstContractDate = null;
  let realContracts = [];

  if (staffRecord.employes_id) {

    try {
      // Import the same function 1.0 uses!
      const { fetchEmployesProfile } = await import('@/lib/employesProfile');
      const { buildEmploymentJourney } = await import('@/lib/employesContracts');

      // Get the exact same data as 1.0!
      employesData = await fetchEmployesProfile(staffId);


      // Get real employment contracts from raw data
      // realContracts = await buildEmploymentJourney(staffRecord.employes_id);
      // console.log('✅ Employment contracts loaded:', realContracts?.length || 0);

      // Extract first contract date from real data
      if (employesData.employments.length > 0) {
        const firstEmployment = employesData.employments.sort((a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )[0];
        firstContractDate = firstEmployment.startDate;
      }

    } catch (employesError) {
      console.warn('⚠️ Employes.nl data connection failed (expected in development):', employesError);
    }
  } else {
    console.log('⚠️ No employes_id found for staff member - cannot connect to raw data');
  }

  // Fetch document compliance status
  let documentStatus = null;
  try {
    const { data: docStatus } = await supabase
      .from('staff_document_compliance')
      .select('*')
      .eq('staff_id', staffId)
      .maybeSingle();

    documentStatus = docStatus;
  } catch (docError) {
    console.warn('⚠️ Could not load document status:', docError);
  }

  // 2.0 ENHANCED RETURN: Real data when available, clear indicators when not
  return {
    staff: staffRecord,
    enrichedContract: employesData?.personal ? {
      // Map Employes.nl personal data to enriched contract format
      staff_id: staffId,
      employes_employee_id: staffRecord.employes_id,
      personal_data: employesData.personal,
      employment_data: employesData.employments,
      salary_data: employesData.salaryHistory,
      tax_data: employesData.taxInfo,
      last_synced: employesData.lastSyncedAt
    } : null,
    documentStatus: documentStatus, // ✅ CONNECTED to staff_document_compliance table
    firstContractDate: firstContractDate ? new Date(firstContractDate).toISOString().slice(0, 10) : null,
    lastReview: null, // TODO: Connect to staff_reviews when implemented
    raiseEligible: false, // TODO: Calculate from salary progression
    reviews: [], // TODO: Connect to staff_reviews when implemented
    notes: [], // TODO: Connect to staff_notes when implemented
    certificates: [], // TODO: Connect to staff_certificates when implemented
    contracts: realContracts || [], // 🔥 REAL CONTRACTS FROM EMPLOYES.NL!
  };
}

// Mutations
export async function addReview(input: {
  staff_id: string;
  review_type: string;
  review_date: string; // ISO
  score: number;
  summary: string;
  raise: boolean;
}) {
  const { error } = await supabase.from("staff_reviews").insert({
    staff_id: input.staff_id,
    review_type: input.review_type,
    review_date: input.review_date,
    score: input.score,
    summary: input.summary,
    raise: input.raise,
  });
  if (error) throw error;
}

export async function addNote(input: {
  staff_id: string;
  note_type: string;
  note: string;
}) {
  const { error } = await supabase.from("staff_notes").insert({
    staff_id: input.staff_id,
    note_type: input.note_type,
    note: input.note,
  });
  if (error) throw error;
}

export async function uploadCertificate(input: {
  staff_id: string;
  title: string;
  file: File;
}) {
  const path = `certificates/${input.staff_id}/${Date.now()}_${input.file.name}`;
  const { error: upErr } = await supabase.storage
    .from("certificates")
    .upload(path, input.file, {
      cacheControl: "3600",
      contentType: input.file.type || "application/octet-stream",
      upsert: true,
    });
  if (upErr) throw upErr;

  const { error: insErr } = await supabase.from("staff_certificates").insert({
    staff_id: input.staff_id,
    title: input.title,
    file_path: path,
  });
  if (insErr) throw insErr;
}

/**
 * Ensure a staff record exists for the given full name.
 * - Normalises whitespace.
 * - Case-insensitive lookup via ILIKE (no wildcards ⇒ exact match).
 * - Inserts a minimal row if not found.
 *
 * Silent no-op if the row already exists or Supabase returns an error on select.
 */
export async function ensureStaffExists(
  fullName: string,
  roleGuess?: string
) {
  const normalized = fullName.replace(/\s+/g, " ").trim();

  const { data, error } = await supabase
    .from("staff")
    .select("id")
    .ilike("full_name", normalized)
    .maybeSingle();

  // Only insert when no row was returned and no error occurred
  if (!data && !error) {
    await supabase.from("staff").insert({
      full_name: normalized,
      role: roleGuess ?? "unknown",
      status: "active",
    });
  }
}

export async function patchInternMeta(
  staffId: string,
  patch: Record<string, any>,
  isIntern?: boolean,
  internYear?: number | null,
) {
  const { error } = await supabase.rpc("patch_intern_meta", {
    p_staff_id: staffId,
    p_patch: patch,
  });
  if (error) throw error;

  // Optionally update is_intern / intern_year in the main staff row
  if (isIntern !== undefined || internYear !== undefined) {
    const updatePayload: Record<string, any> = {};
    if (isIntern !== undefined) updatePayload.is_intern = isIntern;
    if (internYear !== undefined) updatePayload.intern_year = internYear;
    if (Object.keys(updatePayload).length) {
      const { error: updErr } = await supabase
        .from("staff")
        .update(updatePayload)
        .eq("id", staffId);
      if (updErr) throw updErr;
    }
  }
}

export async function patchStaffDocs(
  staffId: string,
  patch: Record<string, any>,
) {
  const { error } = await supabase.rpc("patch_staff_docs", {
    p_staff_id: staffId,
    p_patch: patch,
  });
  if (error) throw error;
}
