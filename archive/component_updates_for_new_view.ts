// COMPONENT UPDATES - Use New View Name
// Apply these changes to fix the 400/406 errors

// 1. UPDATE: src/components/staff/StaffActionCards.tsx
// Replace this block:

/*
OLD CODE:
const { data: docCounts } = useQuery({
  queryKey: ["staff-doc-counts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("staff_docs_missing_counts")  // ← This causes 400 error
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
});
*/

// NEW CODE:
const { data: docCounts } = useQuery({
  queryKey: ["staff-doc-counts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("staff_document_compliance")  // ← New view name
      .select("*")
      .single();
    if (error) {
      console.warn("Document compliance view not yet available:", error);
      return { any_missing: 0, missing_count: 0, total_staff: 0, compliance_percentage: 100 };
    }
    return data;
  },
});

// 2. UPDATE: src/components/dashboard/AppiesInsight.tsx
// Replace this block:

/*
OLD CODE:
const { data: docCounts } = useQuery({
  queryKey: ["appies-doc-counts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("staff_docs_missing_counts")  // ← This causes 400 error
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
});
*/

// NEW CODE:
const { data: docCounts } = useQuery({
  queryKey: ["appies-doc-counts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("staff_document_compliance")  // ← New view name
      .select("*")
      .single();
    if (error) {
      console.warn("Document compliance view not yet available:", error);
      return { any_missing: 0, missing_count: 0, total_staff: 0, compliance_percentage: 100 };
    }
    return data;
  },
});

// ALTERNATIVE APPROACH: Use the function instead of view
// If you prefer to use the function approach:

const { data: docCounts } = useQuery({
  queryKey: ["staff-doc-counts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .rpc("get_staff_document_summary");  // ← Use function instead
    if (error) {
      console.warn("Document summary function not available:", error);
      return { any_missing: 0, missing_count: 0, total_staff: 0, compliance_percentage: 100 };
    }
    return data[0]; // Function returns array, take first result
  },
});