import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export function AppiesInsight() {
  // Get staff needing reviews
  const { data: reviewData = [] } = useQuery({
    queryKey: ["appies-review-needs"],
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
    queryKey: ["appies-doc-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_docs_missing_counts")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Generate smart insights
  const insight = useMemo(() => {
    const insights = [];
    
    if (reviewData.length > 0) {
      insights.push({
        message: `Pssst... ${reviewData.length} staff ${reviewData.length === 1 ? 'needs' : 'need'} reviews in the next 30 days!`,
        action: "Schedule Reviews",
        link: "/reviews",
        urgent: reviewData.length > 5
      });
    }

    if (docCounts?.vog_missing && docCounts.vog_missing > 0) {
      insights.push({
        message: `${docCounts.vog_missing} staff ${docCounts.vog_missing === 1 ? 'is' : 'are'} missing VOG certificates 📄`,
        action: "Send Reminders", 
        link: "/staff?filter=missing-docs",
        urgent: docCounts.vog_missing > 3
      });
    }

    if (insights.length === 0) {
      insights.push({
        message: "Everything looks great! 🧸 All staff are up to date with reviews and documents.",
        action: "View Dashboard",
        link: "/dashboard",
        urgent: false
      });
    }

    // Return a random insight to keep it fresh
    return insights[Math.floor(Math.random() * insights.length)];
  }, [reviewData.length, docCounts]);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-glow ${
      insight.urgent ? 'border-warning bg-warning/5' : 'border-primary/20 bg-primary/5'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${
            insight.urgent ? 'bg-warning/20' : 'bg-primary/20'
          }`}>
            <MessageCircle className={`h-4 w-4 ${
              insight.urgent ? 'text-warning' : 'text-primary'
            }`} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">APPIES SAYS:</span>
              {insight.urgent && (
                <span className="text-xs px-2 py-0.5 bg-warning/20 text-warning rounded-full font-medium">
                  URGENT
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">
              {insight.message}
            </p>
            <Button
              size="sm"
              variant={insight.urgent ? "destructive" : "default"}
              className="text-xs h-7"
              asChild
            >
              <a href={insight.link} className="flex items-center gap-1">
                {insight.action}
                <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
        
        {/* Cute Appies character */}
        <div className="absolute top-2 right-2 text-lg opacity-50">
          🧸
        </div>
      </CardContent>
    </Card>
  );
}
