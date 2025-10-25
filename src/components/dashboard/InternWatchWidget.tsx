import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, CheckCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ErrorFallback } from "@/components/ui/error-fallback";
import type { InternData, StaffDocsStatus } from "@/types/queries";

export function InternWatchWidget() {
  /**
   * Optimized single query with JOIN
   * Requires: 
   *   - staff_with_lms_data view with is_intern, intern_year columns
   *   - staff_docs_status table with is_compliant column
   * Purpose: Get all interns with their document compliance status in one query
   * Optimization: Combines 2 queries into 1 with LEFT JOIN (saves ~200-500ms)
   */
  const { 
    data: internDataWithDocs = [], 
    error: internError, 
    isLoading: internLoading 
  } = useQuery({
    queryKey: ["intern-watch-with-docs"],
    retry: 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_with_lms_data')
        .select(`
          id,
          full_name,
          intern_year,
          is_intern,
          staff_docs_status!inner(is_compliant)
        `)
        .eq('is_intern', true);
      
      if (error) {
        console.error('Intern watch data query error:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Handle errors
  if (internError) {
    return (
      <ErrorFallback 
        message="Unable to load intern data" 
        error={internError} 
      />
    );
  }

  // Show loading state
  if (internLoading) {
    return (
      <Card className="shadow-card animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const internStats = useMemo(() => {
    const byYear = { 1: [], 2: [], 3: [] } as Record<number, any[]>;
    let totalDocsComplete = 0;

    internDataWithDocs.forEach((intern: any) => {
      const year = intern.intern_year || 1;
      if (year >= 1 && year <= 3) {
        byYear[year].push(intern);
      }

      // Use unified document compliance system (same as regular staff)
      const isCompliant = intern.staff_docs_status?.is_compliant || false;
      
      if (isCompliant) {
        totalDocsComplete++;
      }
    });

    const totalInterns = internDataWithDocs.length;
    const avgCompletion = totalInterns > 0 ? (totalDocsComplete / totalInterns) * 100 : 0;

    return {
      byYear,
      totalInterns,
      avgCompletion,
      totalDocsComplete
    };
  }, [internDataWithDocs]);

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
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-success" />
            <span className="text-xs text-muted-foreground">Docs Complete</span>
          </div>
          <div className="text-lg font-bold text-success">
            {internStats.totalDocsComplete}
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

        {/* Action Button */}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/interns">
            <GraduationCap className="h-3 w-3 mr-1" />
            View All Interns
            <ArrowRight className="h-3 w-3 ml-auto" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}