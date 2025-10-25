import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileX, Calendar, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ErrorFallback } from "@/components/ui/error-fallback";
import type { StaffDocsStatus } from "@/types/queries";

export function StaffActionCards() {
  // Get staff needing reviews
  const { data: reviewData = [] } = useQuery({
    queryKey: ["staff-review-needs"],
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts_enriched_v2')
        .select('*')
        .or('needs_six_month_review.eq.true,needs_yearly_review.eq.true');
      
      if (error) {
        console.error('StaffActionCards: Error fetching review data:', error);
        return [];
      }
      return data || [];
    },
  });

  /**
   * Document compliance query
   * Requires: staff_docs_status table with is_compliant, staff_id columns
   * Purpose: Track document compliance for all staff
   */
  const { 
    data: docCounts, 
    error: docError, 
    isLoading: docLoading 
  } = useQuery({
    queryKey: ["staff-doc-counts"],
    retry: 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_docs_status")
        .select<'*', StaffDocsStatus>("is_compliant, staff_id");
      
      if (error) {
        console.error('Document compliance query error:', error);
        throw error;
      }
      
      // Aggregate the data from multiple rows
      if (!data || data.length === 0) {
        return { any_missing: 0, missing_count: 0, total_staff: 0 };
      }
      
      // Count staff with non-compliant status
      const missingCount = data.filter(row => !row.is_compliant).length;
      const anyMissing = missingCount > 0 ? 1 : 0;
      
      return { 
        any_missing: anyMissing,  // Boolean flag: 0 or 1
        missing_count: missingCount,  // Actual count
        total_staff: data.length 
      };
    },
  });

  // Get contract expiring soon
  const { data: expiringContracts = [] } = useQuery({
    queryKey: ["expiring-contracts"],
    retry: false,
    queryFn: async () => {
      const next90Days = new Date();
      next90Days.setDate(next90Days.getDate() + 90);
      
      const { data, error } = await supabase
        .from('contracts_enriched_v2')
        .select('*')
        .not('end_date', 'is', null)
        .lte('end_date', next90Days.toISOString());
      
      if (error) {
        console.error('StaffActionCards: Error fetching expiring contracts:', error);
        return [];
      }
      return data || [];
    },
  });

  // Handle critical errors
  if (docError) {
    return (
      <ErrorFallback 
        message="Unable to load document compliance data" 
        error={docError} 
      />
    );
  }

  // Show loading state
  if (docLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const actionCards = [
    {
      title: "Reviews Needed",
      count: reviewData.length,
      description: "staff need 6mo or yearly reviews",
      icon: Calendar,
      variant: "destructive" as const,
      action: "Schedule Reviews",
    },
    {
      title: "Missing Documents",
      count: docCounts?.any_missing ?? 0,
      description: "staff missing required docs",
      icon: FileX,
      variant: "outline" as const,
      action: "Send Reminders",
    },
    {
      title: "Contracts Expiring",
      count: expiringContracts.length,
      description: "contracts expire in 30 days",
      icon: AlertCircle,
      variant: "secondary" as const,
      action: "Review Renewals",
    },
    {
      title: "Ready for Promotion",
      count: 2, // Placeholder - would need to calculate based on criteria
      description: "interns eligible for contracts",
      icon: UserCheck,
      variant: "default" as const,
      action: "Review Candidates",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
      {actionCards.map((card) => (
        <Card key={card.title} className="transition-all duration-300 hover:shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{card.title}</span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{card.count}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
              </div>
            </div>
            {card.count > 0 && (
              <Button 
                variant={card.variant} 
                size="sm" 
                className="w-full mt-4"
              >
                {card.action}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}