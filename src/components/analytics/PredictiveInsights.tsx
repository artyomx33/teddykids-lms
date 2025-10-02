import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, TrendingUp, Users, Calendar, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { Link } from "react-router-dom";

export function PredictiveInsights() {
  const { data: staffData = [] } = useQuery({
    queryKey: ["predictive-staff-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts_enriched_v2")
        .select("employes_employee_id, full_name, position, first_start, end_date, last_review_date, next_review_due")
        .not("first_start", "is", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: internData = [] } = useQuery({
    queryKey: ["predictive-intern-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("id, full_name, intern_year, is_intern")
        .eq("is_intern", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const predictions = useMemo(() => {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    const nextQuarter = new Date(now);
    nextQuarter.setMonth(now.getMonth() + 3);

    // Contract renewals needed
    const contractsExpiring = staffData.filter(staff => {
      if (!staff.end_date) return false;
      const endDate = new Date(staff.end_date);
      return endDate <= nextQuarter && endDate > now;
    }).length;

    // Review backlog prediction
    const reviewsOverdue = staffData.filter(staff => {
      if (!staff.next_review_due) return false;
      const reviewDate = new Date(staff.next_review_due);
      return reviewDate <= now;
    }).length;

    const reviewsUpcoming = staffData.filter(staff => {
      if (!staff.next_review_due) return false;
      const reviewDate = new Date(staff.next_review_due);
      return reviewDate > now && reviewDate <= nextMonth;
    }).length;

    // Staffing predictions based on intern progression
    const graduatingInterns = internData.filter(intern => intern.intern_year === 3).length;
    const newHiresNeeded = Math.ceil(contractsExpiring * 0.7); // Assume 70% renewal rate

    // Seasonal trends (mock data - would be based on historical patterns)
    const seasonalInsights = {
      peakHiringPeriod: now.getMonth() >= 8 && now.getMonth() <= 10, // Sep-Nov
      vacationSeason: now.getMonth() >= 5 && now.getMonth() <= 7, // Jun-Aug
      reviewSeason: now.getMonth() === 0 || now.getMonth() === 11 // Jan or Dec
    };

    return {
      contractsExpiring,
      reviewsOverdue,
      reviewsUpcoming,
      graduatingInterns,
      newHiresNeeded,
      seasonalInsights
    };
  }, [staffData, internData]);

  const insights = [
    {
      type: "warning",
      icon: AlertTriangle,
      title: "Contract Renewals Needed",
      description: `${predictions.contractsExpiring} contracts expiring in next 3 months`,
      action: "Review renewal pipeline",
      priority: predictions.contractsExpiring > 5 ? "high" : "medium"
    },
    {
      type: "info",
      icon: Calendar,
      title: "Review Forecast",
      description: `${predictions.reviewsUpcoming} reviews due next month, ${predictions.reviewsOverdue} overdue`,
      action: "Schedule review sessions",
      priority: predictions.reviewsOverdue > 0 ? "high" : "low"
    },
    {
      type: "success",
      icon: Users,
      title: "Talent Pipeline",
      description: `${predictions.graduatingInterns} interns graduating soon`,
      action: "Plan conversion strategy",
      priority: "medium"
    },
    {
      type: "forecast",
      icon: TrendingUp,
      title: "Hiring Forecast",
      description: `Estimated ${predictions.newHiresNeeded} new hires needed`,
      action: "Prepare job postings",
      priority: predictions.newHiresNeeded > 3 ? "high" : "low"
    }
  ];

  const getInsightColor = (type: string, priority: string) => {
    if (priority === "high") return "destructive";
    if (type === "success") return "default";
    if (type === "warning") return "secondary";
    return "outline";
  };

  const getActionColor = (priority: string) => {
    if (priority === "high") return "destructive";
    if (priority === "medium") return "default";
    return "outline";
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Predictive Insights
          <Badge variant="outline" className="ml-auto bg-purple-50 text-purple-700">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seasonal Context */}
        {(predictions.seasonalInsights.peakHiringPeriod || 
          predictions.seasonalInsights.vacationSeason || 
          predictions.seasonalInsights.reviewSeason) && (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-900">Seasonal Context</span>
            </div>
            <p className="text-sm text-amber-800">
              {predictions.seasonalInsights.peakHiringPeriod && "Peak hiring season - expect increased recruitment activity."}
              {predictions.seasonalInsights.vacationSeason && "Vacation season approaching - plan for reduced capacity."}
              {predictions.seasonalInsights.reviewSeason && "Annual review season - prepare performance evaluation materials."}
            </p>
          </div>
        )}

        {/* Predictions */}
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${
                  insight.priority === "high" ? "bg-destructive/10" :
                  insight.type === "success" ? "bg-success/10" :
                  "bg-primary/10"
                }`}>
                  <insight.icon className={`h-4 w-4 ${
                    insight.priority === "high" ? "text-destructive" :
                    insight.type === "success" ? "text-success" :
                    "text-primary"
                  }`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{insight.title}</span>
                    <Badge variant={getInsightColor(insight.type, insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
              <Button 
                variant={getActionColor(insight.priority)} 
                size="sm"
                className="shrink-0"
                asChild
              >
                <Link to={insight.title.includes("Contract") ? "/contracts" : 
                         insight.title.includes("Review") ? "/reviews" : 
                         insight.title.includes("Talent") ? "/interns" : "/staff"}>
                  {insight.action}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center p-2">
            <div className="text-lg font-bold text-primary">{predictions.contractsExpiring + predictions.newHiresNeeded}</div>
            <div className="text-xs text-muted-foreground">Actions needed this quarter</div>
          </div>
          <div className="text-center p-2">
            <div className="text-lg font-bold text-success">{predictions.graduatingInterns}</div>
            <div className="text-xs text-muted-foreground">Internal promotions possible</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}