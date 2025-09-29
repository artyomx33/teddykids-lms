import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Enhanced TypeScript interfaces
export interface ActivityData {
  contracts: ContractActivity[];
  reviews: ReviewActivity[];
  documents: DocumentActivity[];
  staff: StaffInfo[];
}

export interface ContractActivity {
  id: string;
  employee_name: string;
  manager: string | null;
  status: string;
  signed_at: string | null;
  created_at: string;
}

export interface ReviewActivity {
  id: string;
  staff_id: string;
  score: number;
  review_date: string;
  review_type: string | null;
}

export interface DocumentActivity {
  id: string;
  staff_id: string;
  certificate_type: string | null;
  uploaded_at: string;
}

export interface StaffInfo {
  id: string;
  full_name: string;
}

export function useActivityData(lastUpdate: Date | null) {
  return useQuery({
    queryKey: ["activity-data", lastUpdate?.getTime()], // Include lastUpdate in query key for real-time invalidation
    queryFn: async (): Promise<ActivityData> => {
      console.log('🔄 Fetching activity data...');

      // Execute all queries in parallel for optimal performance
      const [contractsResponse, reviewsResponse, documentsResponse, staffResponse] =
        await Promise.all([
          supabase
            .from("contracts")
            .select("id, employee_name, manager, status, signed_at, created_at")
            .order("created_at", { ascending: false })
            .limit(10),

          supabase
            .from("staff_reviews")
            .select("id, staff_id, score, review_date, review_type")
            .order("review_date", { ascending: false })
            .limit(5),

          supabase
            .from("staff_certificates")
            .select("id, staff_id, certificate_type, uploaded_at")
            .order("uploaded_at", { ascending: false })
            .limit(5),

          supabase
            .from("staff")
            .select("id, full_name")
        ]);

      // Check for errors
      if (contractsResponse.error) {
        console.error('Contract query error:', contractsResponse.error);
        throw new Error(`Failed to fetch contracts: ${contractsResponse.error.message}`);
      }
      if (reviewsResponse.error) {
        console.error('Reviews query error:', reviewsResponse.error);
        throw new Error(`Failed to fetch reviews: ${reviewsResponse.error.message}`);
      }
      if (documentsResponse.error) {
        console.error('Documents query error:', documentsResponse.error);
        throw new Error(`Failed to fetch documents: ${documentsResponse.error.message}`);
      }
      if (staffResponse.error) {
        console.error('Staff query error:', staffResponse.error);
        throw new Error(`Failed to fetch staff: ${staffResponse.error.message}`);
      }

      const result: ActivityData = {
        contracts: contractsResponse.data ?? [],
        reviews: reviewsResponse.data ?? [],
        documents: documentsResponse.data ?? [],
        staff: staffResponse.data ?? []
      };

      console.log('✅ Activity data fetched successfully:', {
        contracts: result.contracts.length,
        reviews: result.reviews.length,
        documents: result.documents.length,
        staff: result.staff.length
      });

      return result;
    },
    staleTime: 30000, // 30 seconds - data is fresh for 30 seconds
    gcTime: 300000, // 5 minutes - keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}