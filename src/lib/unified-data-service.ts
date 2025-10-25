/**
 * 🎯 UNIFIED DATA SERVICE
 *
 * SINGLE SOURCE OF TRUTH for all staff and contract data
 * Replaces all fragmented queries with one clean interface
 */

import { supabase } from "@/integrations/supabase/client";

export interface StaffData {
  // Basic staff info
  staff_id: string;
  full_name: string;
  email?: string;

  // Current contract info
  current_contract: ContractData | null;
  all_contracts: ContractData[];

  // Enriched data
  reviews: StaffReview[];
  notes: StaffNote[];
  certificates: StaffCertificate[];
  document_status: StaffDocumentStatus | null;

  // Analytics
  total_contracts: number;
  employment_start_date: string | null;
  latest_review_score: number | null;
  has_five_star_badge: boolean;
  needs_review: boolean;
}

export interface ContractData {
  id: string;
  staff_id: string;
  full_name: string;
  position: string;
  location_key: string;
  manager_key: string;
  start_date: string;
  end_date: string | null;
  birth_date: string | null;
  created_at: string;
  updated_at: string;

  // Enriched flags
  has_five_star_badge: boolean;
  needs_six_month_review: boolean;
  needs_yearly_review: boolean;
  next_review_due: string | null;
  last_review_date: string | null;
  avg_review_score: number | null;
  first_start: string | null;
}

interface StaffReview {
  id: string;
  review_date: string;
  score: number;
  notes?: string;
}

interface StaffNote {
  id: string;
  content: string;
  created_at: string;
}

interface StaffCertificate {
  id: string;
  certificate_type: string;
  uploaded_at: string;
  file_path?: string;
}

interface StaffDocumentStatus {
  id: string;
  documents_complete: boolean;
  last_updated: string;
}

export interface ContractFilters {
  staff_id?: string;
  location?: string;
  manager?: string;
  needs_review?: boolean;
  active_only?: boolean;
}

export class UnifiedDataService {

  /**
   * 🎯 MAIN METHOD: Get complete staff data
   * Replaces: fetchStaffDetail, fetchStaffContracts, and 8+ parallel queries
   */
  static async getStaffData(staffId: string): Promise<StaffData> {
    console.log('🎯 UnifiedDataService: Getting staff data for', staffId);

    // Step 1: Get all contracts for this staff member from contracts_enriched
    const contractsResult = await supabase
      .from('contracts_enriched_v2')
      .select('*')
      .eq('staff_id', staffId)
      .order('start_date', { ascending: false });

    if (contractsResult.error) {
      throw new Error(`Failed to fetch contracts: ${contractsResult.error.message}`);
    }

    const contracts = contractsResult.data || [];
    // Successfully fetched from contracts_enriched_v2

    // Step 2: Get related staff data in parallel (but only what's NOT in contracts_enriched)
    const [reviewsResult, notesResult, certificatesResult, documentStatusResult] = await Promise.all([
      supabase
        .from('staff_reviews')
        .select('*')
        .eq('staff_id', staffId)
        .order('review_date', { ascending: false }),

      supabase
        .from('staff_notes')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false }),

      supabase
        .from('staff_certificates')
        .select('*')
        .eq('staff_id', staffId)
        .order('uploaded_at', { ascending: false }),

      supabase
        .from('staff_docs_status')
        .select('*')
        .eq('staff_id', staffId)
        .maybeSingle()
    ]);

    // Check for errors
    if (reviewsResult.error) throw new Error(`Failed to fetch reviews: ${reviewsResult.error.message}`);
    if (notesResult.error) throw new Error(`Failed to fetch notes: ${notesResult.error.message}`);
    if (certificatesResult.error) throw new Error(`Failed to fetch certificates: ${certificatesResult.error.message}`);
    if (documentStatusResult.error) throw new Error(`Failed to fetch document status: ${documentStatusResult.error.message}`);

    // Step 3: Transform and structure the data
    const transformedContracts: ContractData[] = contracts.map(contract => ({
      id: contract.id,
      staff_id: contract.staff_id,
      full_name: contract.full_name,
      position: contract.position || 'Unknown',
      location_key: contract.location_key || 'unknown',
      manager_key: contract.manager_key || 'unknown',
      start_date: contract.start_date,
      end_date: contract.end_date,
      birth_date: contract.birth_date,
      created_at: contract.created_at,
      updated_at: contract.updated_at,
      has_five_star_badge: contract.has_five_star_badge || false,
      needs_six_month_review: contract.needs_six_month_review || false,
      needs_yearly_review: contract.needs_yearly_review || false,
      next_review_due: contract.next_review_due,
      last_review_date: contract.last_review_date,
      avg_review_score: contract.avg_review_score,
      first_start: contract.first_start,
    }));

    // Find current (most recent active) contract
    const currentContract = transformedContracts.find(c =>
      !c.end_date || new Date(c.end_date) > new Date()
    ) || transformedContracts[0] || null;

    // Calculate analytics
    const latestReview = reviewsResult.data?.[0];
    const employmentStartDate = transformedContracts.length > 0
      ? transformedContracts[transformedContracts.length - 1].start_date
      : null;

    const staffData: StaffData = {
      staff_id: staffId,
      full_name: currentContract?.full_name || 'Unknown',
      email: undefined, // Would need to be added to contracts_enriched if needed

      current_contract: currentContract,
      all_contracts: transformedContracts,

      reviews: (reviewsResult.data || []) as StaffReview[],
      notes: (notesResult.data || []) as StaffNote[],
      certificates: (certificatesResult.data || []) as StaffCertificate[],
      document_status: documentStatusResult.data as StaffDocumentStatus | null,

      total_contracts: transformedContracts.length,
      employment_start_date: employmentStartDate,
      latest_review_score: latestReview?.score || null,
      has_five_star_badge: currentContract?.has_five_star_badge || false,
      needs_review: currentContract?.needs_six_month_review || currentContract?.needs_yearly_review || false,
    };

    console.log('✅ UnifiedDataService: Staff data assembled', {
      contracts: transformedContracts.length,
      reviews: staffData.reviews.length,
      currentContract: !!currentContract
    });

    return staffData;
  }

  /**
   * 🎯 Get contracts data with filters
   * Replaces: All dashboard, analytics, and insights queries
   */
  static async getContractsData(filters?: ContractFilters): Promise<ContractData[]> {
    console.log('🎯 UnifiedDataService: Getting contracts data with filters', filters);

    let query = supabase
      .from('contracts_enriched_v2')
      .select('*')
      .order('start_date', { ascending: false });

    // Apply filters
    if (filters?.staff_id) {
      query = query.eq('staff_id', filters.staff_id);
    }

    if (filters?.location) {
      query = query.eq('location_key', filters.location.toLowerCase());
    }

    if (filters?.manager) {
      query = query.eq('manager_key', filters.manager.toLowerCase());
    }

    if (filters?.needs_review) {
      query = query.or('needs_six_month_review.eq.true,needs_yearly_review.eq.true');
    }

    if (filters?.active_only) {
      query = query.or('end_date.is.null,end_date.gte.now()');
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch contracts data: ${error.message}`);
    }

    const transformedContracts: ContractData[] = (data || []).map(contract => ({
      id: contract.id,
      staff_id: contract.staff_id,
      full_name: contract.full_name,
      position: contract.position || 'Unknown',
      location_key: contract.location_key || 'unknown',
      manager_key: contract.manager_key || 'unknown',
      start_date: contract.start_date,
      end_date: contract.end_date,
      birth_date: contract.birth_date,
      created_at: contract.created_at,
      updated_at: contract.updated_at,
      has_five_star_badge: contract.has_five_star_badge || false,
      needs_six_month_review: contract.needs_six_month_review || false,
      needs_yearly_review: contract.needs_yearly_review || false,
      next_review_due: contract.next_review_due,
      last_review_date: contract.last_review_date,
      avg_review_score: contract.avg_review_score,
      first_start: contract.first_start,
    }));

    console.log(`✅ UnifiedDataService: Found ${transformedContracts.length} contracts`);
    return transformedContracts;
  }

  /**
   * 🎯 Quick analytics summary
   */
  static async getAnalyticsSummary() {
    console.log('🎯 UnifiedDataService: Getting analytics summary');

    const { data, error } = await supabase
      .from('contracts_enriched_v2')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch analytics data: ${error.message}`);
    }

    const contracts = data || [];
    const activeContracts = contracts.filter(c =>
      !c.end_date || new Date(c.end_date) > new Date()
    );

    const needingReview = contracts.filter(c =>
      c.needs_six_month_review || c.needs_yearly_review
    );

    const fiveStarStaff = contracts.filter(c => c.has_five_star_badge);

    return {
      total_contracts: contracts.length,
      active_contracts: activeContracts.length,
      needing_review: needingReview.length,
      five_star_staff: fiveStarStaff.length,
    };
  }

  /**
   * 🧪 DEBUG: Test data consistency
   */
  static async debugDataConsistency(staffId: string) {
    console.log('🧪 DEBUG: Testing data consistency for', staffId);

    // Test the new unified approach
    const unifiedData = await this.getStaffData(staffId);

    // Compare with old fragmented approach (for debugging)
    const [oldContracts, oldEnriched] = await Promise.all([
      supabase.from('contracts').select('*').eq('staff_id', staffId),
      supabase.from('contracts_enriched_v2').select('*').eq('staff_id', staffId)
    ]);

    console.log('🧪 Data consistency check:', {
      unified_contracts: unifiedData.all_contracts.length,
      old_contracts: oldContracts.data?.length || 0,
      old_enriched: oldEnriched.data?.length || 0,
      unified_current: !!unifiedData.current_contract,
      unified_name: unifiedData.full_name,
    });

    return {
      unified: unifiedData,
      legacy: {
        contracts: oldContracts.data,
        enriched: oldEnriched.data,
      }
    };
  }
}