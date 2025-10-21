import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Users, CheckCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { log, logger } from "@/lib/logger";
import { useMemo } from "react";
import { Link } from "react-router-dom";

export function InternWatchWidget() {
  const { data: internData = [] } = useQuery({
    queryKey: ["intern-watch-data"],
    retry: false,
    queryFn: async () => {
      // TODO: CONNECT - staff.is_intern column not available yet
      // Returning mock data until database column is created
      // Silently use mock data - controlled by LOG_CONFIG.mockData;
      return [];
    },
  });

  const internStats = useMemo(() => {
    const byYear = { 1: [], 2: [], 3: [] } as Record<number, any[]>;
    let totalDocsComplete = 0;
    let readyForContracts = 0;

    internData.forEach((intern) => {
      const year = intern.intern_year || 1;
      if (year >= 1 && year <= 3) {
        byYear[year].push(intern);
      }

      // Calculate document completion (simplified - assumes 7 required docs)
      const docs = intern.staff_docs || {};
      const completedDocs = Object.values(docs).filter(Boolean).length;
      const completionRate = completedDocs / 7;
      
      if (completionRate >= 0.8) {
        totalDocsComplete++;
      }

      // Ready for contracts (Y3 with 80%+ docs)
      if (year === 3 && completionRate >= 0.8) {
        readyForContracts++;
      }
    });

    const totalInterns = internData.length;
    const avgCompletion = totalInterns > 0 ? (totalDocsComplete / totalInterns) * 100 : 0;

    return {
      byYear,
      totalInterns,
      avgCompletion,
      readyForContracts,
      totalDocsComplete
    };
  }, [internData]);

  if (internStats.totalInterns === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4 text-blue-500" />
            Intern Watch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 space-y-2">
            <div className="text-2xl opacity-50">🎓</div>
            <p className="text-sm text-muted-foreground">
              No active interns at the moment
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-blue-500" />
          Intern Watch
          <Badge variant="secondary" className="ml-auto">
            {internStats.totalInterns}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              <span className="text-xs text-muted-foreground">Docs Complete</span>
            </div>
            <div className="text-lg font-bold text-success">
              {internStats.totalDocsComplete}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">Ready for Contracts</span>
            </div>
            <div className="text-lg font-bold text-primary">
              {internStats.readyForContracts}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Overall Progress</span>
            <span className="text-xs font-medium">{Math.round(internStats.avgCompletion)}%</span>
          </div>
          <Progress value={internStats.avgCompletion} className="h-2" />
        </div>

        {/* By Year Breakdown */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">By Year</span>
          {[1, 2, 3].map((year) => (
            <div key={year} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Y{year}
                </Badge>
                <span className="text-sm text-foreground">
                  {internStats.byYear[year].length} intern{internStats.byYear[year].length !== 1 ? 's' : ''}
                </span>
              </div>
              {year === 3 && internStats.byYear[year].length > 0 && (
                <Badge variant="default">
                  Graduating
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/interns">
              <GraduationCap className="h-3 w-3 mr-1" />
              View All Interns
              <ArrowRight className="h-3 w-3 ml-auto" />
            </Link>
          </Button>
          {internStats.readyForContracts > 0 && (
            <Button size="sm" className="w-full bg-gradient-primary">
              Review {internStats.readyForContracts} Ready for Contracts
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}