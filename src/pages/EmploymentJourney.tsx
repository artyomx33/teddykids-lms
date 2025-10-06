import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmploymentJourneyMap } from '@/components/employes/EmploymentJourneyMap';
import { buildEmploymentJourney, EmploymentJourney } from '@/lib/employesContracts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Error Boundaries
import { ErrorBoundary, PageErrorBoundary } from "@/components/error-boundaries/ErrorBoundary";

export default function EmploymentJourneyPage() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<EmploymentJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [staffName, setStaffName] = useState('');

  useEffect(() => {
    async function loadJourney() {
      if (!staffId) return;

      try {
        setLoading(true);
        const journeyData = await buildEmploymentJourney(staffId);
        
        if (journeyData) {
          setJourney(journeyData);
          setStaffName(journeyData.employeeName);
        } else {
          toast({
            title: 'No Data Found',
            description: 'No employment journey data available for this employee',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error loading employment journey:', error);
        toast({
          title: 'Error',
          description: 'Failed to load employment journey data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    loadJourney();
  }, [staffId]);

  // Real-time updates for employment data changes
  useEffect(() => {
    if (!staffId) return;

    const channel = supabase.channel('employment-journey-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employes_raw_data',
          filter: `endpoint=eq./employments`
        },
        () => {
          console.log('[EmploymentJourneyPage] Employment data changed, reloading...');
          // Reload the journey data
          buildEmploymentJourney(staffId).then(journeyData => {
            if (journeyData) {
              setJourney(journeyData);
              setStaffName(journeyData.employeeName);
              toast({
                title: 'Employment Data Updated',
                description: 'Timeline has been refreshed with latest data',
              });
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [staffId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No employment journey data available</p>
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Staff
        </Button>
      </div>

      <ErrorBoundary  componentName="EmploymentJourneyMap">
        <EmploymentJourneyMap journey={journey} staffName={staffName} />
      </ErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}
