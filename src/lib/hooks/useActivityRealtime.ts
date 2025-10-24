import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
interface ActivityRealtimeState {
  lastUpdate: Date | null;
  isConnected: boolean;
  connectionCount: number;
}

export function useActivityRealtime() {
  const [state, setState] = useState<ActivityRealtimeState>({
    lastUpdate: null,
    isConnected: false,
    connectionCount: 0
  });

  useEffect(() => {
    log.realtimeStatus('activity-feed', 'Setting up subscriptions');

    // Create a single channel for all activity updates
    const channel = supabase
      .channel('activity-feed-realtime')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contracts',
          // Only listen to meaningful changes (not every update)
          filter: 'status=in.(signed,pending,generated)'
        },
        (payload) => {
          log.realtimeStatus('contracts', 'Activity update received');
          setState(prev => ({
            ...prev,
            lastUpdate: new Date(),
            connectionCount: prev.connectionCount + 1
          }));
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_reviews'
        },
        (payload) => {
          log.realtimeStatus('reviews', 'Activity update received');
          setState(prev => ({
            ...prev,
            lastUpdate: new Date(),
            connectionCount: prev.connectionCount + 1
          }));
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_certificates'
        },
        (payload) => {
          log.realtimeStatus('certificates', 'Activity update received');
          setState(prev => ({
            ...prev,
            lastUpdate: new Date(),
            connectionCount: prev.connectionCount + 1
          }));
        }
      )
      .subscribe((status) => {
        log.realtimeStatus('activity-feed', status);
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED'
        }));
      });

    // Cleanup function
    return () => {
      log.realtimeStatus('activity-feed', 'Cleaning up subscriptions');
      channel.unsubscribe();
    };
  }, []);

  return state;
}