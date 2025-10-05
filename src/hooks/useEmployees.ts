import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeRawData {
  id: string;
  employee_id: string;
  api_response: any; // JSON from API
  endpoint: string;
  is_latest: boolean;
  collected_at: string;
  created_at: string;
  updated_at: string;
}

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees-raw-data'],
    queryFn: async (): Promise<EmployeeRawData[]> => {
      // Get latest employee data, prioritizing /employee endpoint for personal info
      const { data, error } = await supabase
        .from('employes_raw_data')
        .select('*')
        .eq('is_latest', true)
        .eq('endpoint', '/employee')
        .order('collected_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Debug: Log the first employee's data structure
      if (data && data.length > 0) {
        console.log('Sample employee data:', {
          employee_id: data[0].employee_id,
          endpoint: data[0].endpoint,
          api_response_keys: Object.keys(data[0].api_response || {}),
          api_response_sample: data[0].api_response
        });
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};