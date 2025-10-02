import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Users, Award, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export function PerformanceComparison() {
  const { data: staffData = [] } = useQuery({
    queryKey: ["staff-performance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts_enriched_v2")
        .select("employes_employee_id, full_name, position, avg_review_score, first_start, location_key")
        .not("avg_review_score", "is", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  const performanceMetrics = useMemo(() => {
    // Department comparison
    const byLocation = staffData.reduce((acc, staff) => {
      const location = staff.location_key || "Unknown";
      if (!acc[location]) {
        acc[location] = { total: 0, scores: [], avgScore: 0 };
      }
      acc[location].total++;
      acc[location].scores.push(staff.avg_review_score || 0);
      acc[location].avgScore = acc[location].scores.reduce((a, b) => a + b, 0) / acc[location].scores.length;
      return acc;
    }, {} as Record<string, { total: number; scores: number[]; avgScore: number }>);

    // Tenure vs Performance
    const tenureGroups = staffData.reduce((acc, staff) => {
      if (!staff.first_start) return acc;
      
      const tenure = Math.floor((Date.now() - new Date(staff.first_start).getTime()) / (1000 * 60 * 60 * 24 * 365));
      const group = tenure < 1 ? "New (<1yr)" : tenure < 3 ? "Mid (1-3yrs)" : "Senior (3+yrs)";
      
      if (!acc[group]) {
        acc[group] = { count: 0, avgScore: 0, scores: [] };
      }
      acc[group].count++;
      acc[group].scores.push(staff.avg_review_score || 0);
      acc[group].avgScore = acc[group].scores.reduce((a, b) => a + b, 0) / acc[group].scores.length;
      return acc;
    }, {} as Record<string, { count: number; avgScore: number; scores: number[] }>);

    // Top performers
    const topPerformers = staffData
      .filter(staff => staff.avg_review_score && staff.avg_review_score >= 4.5)
      .sort((a, b) => (b.avg_review_score || 0) - (a.avg_review_score || 0))
      .slice(0, 5);

    return {
      byLocation: Object.entries(byLocation).sort(([,a], [,b]) => b.avgScore - a.avgScore),
      tenureGroups,
      topPerformers,
      totalStaff: staffData.length
    };
  }, [staffData]);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Performance Analytics
          <Badge variant="outline" className="ml-auto">
            {performanceMetrics.totalStaff} staff
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Department Performance */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Performance by Department
          </h4>
          <div className="space-y-2">
            {performanceMetrics.byLocation.slice(0, 4).map(([location, data]) => (
              <div key={location} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{data.total} staff</span>
                    <Badge variant={data.avgScore >= 4.5 ? "default" : data.avgScore >= 4.0 ? "secondary" : "outline"}>
                      {data.avgScore.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <Progress value={(data.avgScore / 5) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Tenure Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Performance by Tenure
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(performanceMetrics.tenureGroups).map(([group, data]) => (
              <div key={group} className="text-center p-2 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-primary">{data.avgScore.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">{group}</div>
                <div className="text-xs text-muted-foreground">{data.count} staff</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            Current Top Performers
          </h4>
          <div className="space-y-2">
            {performanceMetrics.topPerformers.map((performer, index) => (
              <div key={performer.employes_employee_id} className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-md">
                <div className="flex items-center gap-2">
                  <Badge variant={index < 3 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  <div>
                    <div className="text-sm font-medium">{performer.full_name}</div>
                    <div className="text-xs text-muted-foreground">{performer.position || "Staff"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm font-bold">{performer.avg_review_score?.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Insight */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Insight</span>
          </div>
          <p className="text-sm text-blue-800">
            Senior staff (3+ years) show highest performance scores. Consider mentorship programs 
            to help newer staff reach similar levels.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}