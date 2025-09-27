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

// Data access
export async function fetchStaffList(): Promise<StaffListItem[]> {
  // Optimized single query using RPC for better performance
  const { data, error } = await supabase.rpc('get_staff_list_optimized');
  
  if (error) {
    console.warn('Optimized query failed, falling back to manual join:', error);
    return fetchStaffListFallback();
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
  const { data: staff, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", staffId)
    .single();
  if (error) throw error;

  if (!staff) {
    throw new Error(`Staff with id ${staffId} not found`);
  }

  const staffRecord = staff as Staff;

  const [
    enrichedContractResult,
    firstContractResult,
    reviewsResult,
    notesResult,
    certificatesResult,
    documentStatusResult,
    contracts,
  ] = await Promise.all([
    supabase
      .from("contracts_enriched")
      .select("*")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("contracts")
      .select("created_at, query_params")
      .eq("employee_name", staffRecord.full_name)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("staff_reviews")
      .select("*")
      .eq("staff_id", staffId)
      .order("review_date", { ascending: false }),
    supabase
      .from("staff_notes")
      .select("*")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false }),
    supabase
      .from("staff_certificates")
      .select("*")
      .eq("staff_id", staffId)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("staff_docs_status")
      .select("*")
      .eq("staff_id", staffId)
      .maybeSingle(),
    fetchStaffContracts(staffRecord.full_name),
  ]);

  if (enrichedContractResult.error) throw enrichedContractResult.error;
  if (firstContractResult.error) throw firstContractResult.error;
  if (reviewsResult.error) throw reviewsResult.error;
  if (notesResult.error) throw notesResult.error;
  if (certificatesResult.error) throw certificatesResult.error;
  if (documentStatusResult.error) throw documentStatusResult.error;

  const enrichedContract = enrichedContractResult.data;
  const firstContract = firstContractResult.data;
  const reviews = (reviewsResult.data ?? []) as StaffReview[];
  const notes = (notesResult.data ?? []) as StaffNote[];
  const certs = (certificatesResult.data ?? []) as StaffCertificate[];
  const docStatus = documentStatusResult.data;

  const firstContractDate =
    enrichedContract?.start_date ??
    (firstContract?.query_params as any)?.startDate ??
    firstContract?.created_at ??
    null;

  const lastReview = reviews[0]?.review_date ?? null;
  const raiseEligible = !!reviews.find((r) => r.raise);

  return {
    staff: staffRecord,
    enrichedContract: enrichedContract as any,
    documentStatus: docStatus as any,
    firstContractDate: firstContractDate
      ? new Date(firstContractDate).toISOString().slice(0, 10)
      : null,
    lastReview,
    raiseEligible,
    reviews,
    notes,
    certificates: certs,
    contracts: contracts,
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
