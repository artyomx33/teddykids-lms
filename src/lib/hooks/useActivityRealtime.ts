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
    // Setting up real-time subscriptions for activity feed
    
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
          // Activity update received
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
          // Activity update received
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
          // Activity update received
          setState(prev => ({
            ...prev,
            lastUpdate: new Date(),
            connectionCount: prev.connectionCount + 1
          }));
        }
      )
      .subscribe((status) => {
        // Real-time connection status changed
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED'
        }));
      });

    // Cleanup function
    return () => {
      // Cleaning up real-time subscriptions
      channel.unsubscribe();
    };
  }, []);

  return state;
}