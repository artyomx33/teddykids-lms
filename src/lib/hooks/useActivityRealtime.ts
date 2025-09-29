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
    console.log('🔴 Setting up real-time activity feed subscriptions...');

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
          console.log('📄 Contract activity update:', payload);
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
          console.log('⭐ Review activity update:', payload);
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
          console.log('📋 Certificate activity update:', payload);
          setState(prev => ({
            ...prev,
            lastUpdate: new Date(),
            connectionCount: prev.connectionCount + 1
          }));
        }
      )
      .subscribe((status) => {
        console.log('🔌 Activity feed subscription status:', status);
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED'
        }));
      });

    // Cleanup function
    return () => {
      console.log('🔴 Cleaning up activity feed subscriptions...');
      channel.unsubscribe();
    };
  }, []);

  return state;
}