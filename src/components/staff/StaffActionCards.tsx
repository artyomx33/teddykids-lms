import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileX, Calendar, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function StaffActionCards() {
  // Get staff needing reviews
  const { data: reviewData = [] } = useQuery({
    queryKey: ["staff-review-needs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts_enriched")
        .select("staff_id, full_name, needs_six_month_review, needs_yearly_review")
        .or("needs_six_month_review.eq.true,needs_yearly_review.eq.true");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Get document missing counts
  const { data: docCounts } = useQuery({
    queryKey: ["staff-doc-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_docs_missing_counts")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Get contract expiring soon
  const { data: expiringContracts = [] } = useQuery({
    queryKey: ["expiring-contracts"],
    queryFn: async () => {
      const next30Days = new Date();
      next30Days.setDate(next30Days.getDate() + 30);
      
      const { data, error } = await supabase
        .from("contracts_enriched")
        .select("staff_id, full_name, end_date")
        .not("end_date", "is", null)
        .lte("end_date", next30Days.toISOString().slice(0, 10))
        .gt("end_date", new Date().toISOString().slice(0, 10));
      if (error) throw error;
      return data ?? [];
    },
  });

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {actionCards.map((card) => (
        <Card key={card.title} className="hover:shadow-soft transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{card.title}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{card.count}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
              </div>
            </div>
            {card.count > 0 && (
              <Button 
                variant={card.variant} 
                size="sm" 
                className="w-full mt-3"
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