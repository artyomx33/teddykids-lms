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
      if (import.meta.env.DEV) {
        console.log('🔍 [activityFeed] Fetching activity data');
      }

      // Execute queries in parallel for optimal performance (using raw data only)
      const [contractsResponse, staffResponse] =
        await Promise.all([
          supabase
            .from("contracts")
            .select("id, employee_name, manager, status, signed_at, created_at")
            .order("created_at", { ascending: false })
            .limit(10),

          supabase
            .from("staff")
            .select("id, full_name")
        ]);

      // Check for errors
      if (contractsResponse.error) {
        console.error('contracts', contractsResponse.error);
        throw new Error(`Failed to fetch contracts: ${contractsResponse.error.message}`);
      }
      if (staffResponse.error) {
        console.error('staff', staffResponse.error);
        throw new Error(`Failed to fetch staff: ${staffResponse.error.message}`);
      }

      const result: ActivityData = {
        contracts: contractsResponse.data ?? [],
        reviews: [], // Using raw data only - no reviews table yet
        documents: [], // Using raw data only - no documents table yet
        staff: staffResponse.data ?? []
      };

      if (import.meta.env.DEV) {
        console.log('📊 [activityFeed] Activity data fetched:', {
          contracts: result.contracts.length,
          reviews: result.reviews.length,
          documents: result.documents.length,
          staff: result.staff.length
        });
      }

      return result;
    },
    staleTime: 30000, // 30 seconds - data is fresh for 30 seconds
    gcTime: 300000, // 5 minutes - keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}