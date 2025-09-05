import { supabase } from "@/integrations/supabase/client";

// Types
export type Staff = {
  id: string;
  full_name: string;
  email: string | null;
  location: string | null;
  role: string | null;
  status: "active" | "inactive" | string;
  created_at: string;
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
  /** Soft-delete flag – notes with `true` are hidden by default */
  is_archived?: boolean;
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
  firstContractDate: string | null;
  lastReview: string | null;
  raiseEligible: boolean;
  reviews: StaffReview[];
  notes: StaffNote[];
  certificates: StaffCertificate[];
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
  // Join staff with derived first contract date and latest review
  // First contract date from contracts, fallback null
  const { data: staffRows, error } = await supabase
    .from("staff")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw error;

  const list: StaffListItem[] = [];
  for (const s of (staffRows ?? []) as Staff[]) {
    const { data: firstContract } = await supabase
      .from("contracts")
      .select("created_at, query_params")
      .eq("employee_name", s.full_name)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const firstContractDate =
      (firstContract?.query_params as any)?.startDate ??
      firstContract?.created_at ??
      null;

    const { data: lastReview } = await supabase
      .from("staff_reviews")
      .select("review_date")
      .eq("staff_id", s.id)
      .order("review_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const hasRecentReview =
      !!lastReview?.review_date &&
      new Date().getTime() - new Date(lastReview.review_date).getTime() <
        1000 * 60 * 60 * 24 * 365; // within 1 year

    list.push({
      id: s.id,
      name: s.full_name,
      firstContractDate: firstContractDate
        ? new Date(firstContractDate).toISOString().slice(0, 10)
        : null,
      active: s.status === "active",
      lastReviewDate: lastReview?.review_date ?? null,
      hasRecentReview,
      role: s.role,
      location: s.location,
    });
  }

  return list;
}

export async function fetchStaffDetail(staffId: string): Promise<StaffDetail> {
  const { data: staff, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", staffId)
    .single();
  if (error) throw error;

  const { data: firstContract } = await supabase
    .from("contracts")
    .select("created_at, query_params")
    .eq("employee_name", (staff as Staff).full_name)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const firstContractDate =
    (firstContract?.query_params as any)?.startDate ??
    firstContract?.created_at ??
    null;

  const { data: reviews } = await supabase
    .from("staff_reviews")
    .select("*")
    .eq("staff_id", staffId)
    .order("review_date", { ascending: false });

  const { data: notes } = await supabase
    .from("staff_notes")
    .select("*")
    .eq("staff_id", staffId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  const { data: certs } = await supabase
    .from("staff_certificates")
    .select("*")
    .eq("staff_id", staffId)
    .order("uploaded_at", { ascending: false });

  const lastReview = reviews?.[0]?.review_date ?? null;
  const raiseEligible = !!reviews?.find((r) => r.raise);

  return {
    staff: staff as Staff,
    firstContractDate: firstContractDate
      ? new Date(firstContractDate).toISOString().slice(0, 10)
      : null,
    lastReview,
    raiseEligible,
    reviews: (reviews ?? []) as StaffReview[],
    notes: (notes ?? []) as StaffNote[],
    certificates: (certs ?? []) as StaffCertificate[],
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
/**
 * List notes for a staff member with optional inclusion of archived items.
 */
export async function listNotes(
  staffId: string,
  opts?: { includeArchived?: boolean },
): Promise<StaffNote[]> {
  const q = supabase
    .from("staff_notes")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });

  if (!opts?.includeArchived) {
    q.eq("is_archived", false);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as StaffNote[];
}

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

// Notes helpers -------------------------------------------------------------

/**
 * Archive / un-archive a note (soft delete).
 */
export async function setNoteArchived(noteId: string, archived: boolean) {
  const { error } = await supabase
    .from("staff_notes")
    .update({ is_archived: archived })
    .eq("id", noteId);
  if (error) throw error;
}

// JSONB patch helpers -------------------------------------------------------

export async function patchInternMeta(
  staffId: string,
  patch: Record<string, any>,
) {
  const { error } = await supabase.rpc("patch_intern_meta", {
    p_staff_id: staffId,
    p_patch: patch,
  });
  if (error) throw error;
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
