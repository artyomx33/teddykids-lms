import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to listen for real-time employment data changes from Employes.nl
 * Automatically refetches employment journey when new data arrives
 */
export function useEmploymentRealtime(staffId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!staffId) return;

    console.log('[useEmploymentRealtime] Setting up real-time listener for staff:', staffId);

    // Subscribe to changes in employes_raw_data for this employee
    const channel = supabase
      .channel('employment-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'employes_raw_data',
          filter: `endpoint=eq./employments`
        },
        (payload) => {
          console.log('[useEmploymentRealtime] New employment data detected:', payload);
          
          // Invalidate employment journey query to refetch
          queryClient.invalidateQueries({ queryKey: ['employment-journey', staffId] });
          
          // Show toast notification
          toast({
            title: 'Employment Data Updated',
            description: 'New employment information has been synced from Employes.nl',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'employes_raw_data',
          filter: `endpoint=eq./employments`
        },
        (payload) => {
          console.log('[useEmploymentRealtime] Employment data updated:', payload);
          
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['employment-journey', staffId] });
          
          toast({
            title: 'Employment Data Updated',
            description: 'Employment information has been updated',
          });
        }
      )
      .subscribe();

    return () => {
      console.log('[useEmploymentRealtime] Cleaning up real-time listener');
      supabase.removeChannel(channel);
    };
  }, [staffId, queryClient]);
}
