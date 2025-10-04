import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, TrendingUp, Users, Calendar, Target, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SmartSuggestion {
  id: string;
  type: 'optimization' | 'recognition' | 'scheduling' | 'compliance' | 'growth';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionText: string;
  actionLink: string;
  confidence: number;
}

export function SmartSuggestions() {
  const navigate = useNavigate();
  
  const { data: suggestions = [] } = useQuery({
    queryKey: ["smart-suggestions"],
    queryFn: async (): Promise<SmartSuggestion[]> => {
      const suggestions: SmartSuggestion[] = [];

      try {
        // Analyze review patterns for optimization suggestions
        const { data: reviewStats, error: reviewError } = await supabase
          .from("staff_reviews")
          .select("staff_id, score, review_date")
          .gte("review_date", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

        let reviewStatsData = reviewStats;
        if (reviewError) {
          console.log('SmartSuggestions: staff_reviews error, using raw data only');
          reviewStatsData = [];
        }

        if (reviewStatsData && reviewStatsData.length > 0) {
          // Find consistently high performers
          const staffScores = reviewStatsData.reduce((acc: any, review: any) => {
            if (!acc[review.staff_id]) acc[review.staff_id] = [];
            acc[review.staff_id].push(review.score);
            return acc;
          }, {});

          const highPerformers = Object.entries(staffScores)
            .filter(([, scores]: [string, any]) => {
              const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
              return avg >= 4.5 && scores.length >= 2;
            })
            .length;

          if (highPerformers >= 3) {
            suggestions.push({
              id: 'high-performer-recognition',
              type: 'recognition',
              title: 'Recognition Program Opportunity',
              description: `${highPerformers} staff members are consistently exceeding expectations. Consider implementing a formal recognition program or bonus structure.`,
              impact: 'high',
              actionText: 'Review Top Performers',
              actionLink: '/staff',
              confidence: 85
            });
          }
        }

        // Analyze document completion patterns
        const { data: docStats } = await supabase
          .from("staff_docs_status")
          .select("missing_count, full_name");

        if (docStats) {
          const completeCount = docStats.filter(staff => staff.missing_count === 0).length;
          const totalStaff = docStats.length;
          const completionRate = totalStaff > 0 ? (completeCount / totalStaff) * 100 : 0;

          if (completionRate < 70 && completionRate > 40) {
            suggestions.push({
              id: 'doc-completion-push',
              type: 'compliance',
              title: 'Document Completion Sprint',
              description: `${Math.round(completionRate)}% document completion rate. A focused 2-week sprint could achieve 100% compliance.`,
              impact: 'medium',
              actionText: 'Plan Sprint',
              actionLink: '/staff?filter=missing-docs',
              confidence: 78
            });
          }
        }

        // Check for review scheduling optimization
        const { data: upcomingReviews, error: contractError } = await supabase
          .from("contracts_enriched")
          .select("needs_six_month_review, needs_yearly_review")
          .or("needs_six_month_review.eq.true,needs_yearly_review.eq.true");

        let upcomingReviewsData = upcomingReviews;
        if (contractError && contractError.code === 'PGRST205') {
          console.log('SmartSuggestions: contracts_enriched table not found, using mock data');
          upcomingReviewsData = [];
        }

        if (upcomingReviewsData && upcomingReviewsData.length > 0) {
          const reviewCount = upcomingReviewsData.length;
          if (reviewCount >= 5) {
            suggestions.push({
              id: 'review-batch-scheduling',
              type: 'scheduling',
              title: 'Batch Review Scheduling',
              description: `${reviewCount} reviews are due soon. Batch scheduling over 2-3 weeks would optimize manager time and ensure consistent quality.`,
              impact: 'high',
              actionText: 'Schedule Reviews',
              actionLink: '/reviews',
              confidence: 92
            });
          }
        }

        // Growth opportunity analysis
        const currentMonth = new Date().getMonth();
        if (currentMonth === 11 || currentMonth === 0) { // December or January
          suggestions.push({
            id: 'year-end-planning',
            type: 'growth',
            title: 'Year-End Growth Planning',
            description: 'Perfect timing for career development conversations, goal setting, and promotion planning sessions.',
            impact: 'medium',
            actionText: 'Plan Sessions',
            actionLink: '/staff',
            confidence: 70
          });
        }

        // Seasonal optimization
        if (currentMonth >= 2 && currentMonth <= 4) { // Spring months
          suggestions.push({
            id: 'spring-optimization',
            type: 'optimization',
            title: 'Spring Process Optimization',
            description: 'Spring is ideal for process improvements. Review workflows, update procedures, and implement efficiency gains.',
            impact: 'medium',
            actionText: 'Review Processes',
            actionLink: '/insights',
            confidence: 65
          });
        }

      } catch (error) {
        console.error("Error generating smart suggestions:", error);
      }

      // Sort by impact and confidence
      return suggestions.sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        if (impactOrder[a.impact] !== impactOrder[b.impact]) {
          return impactOrder[b.impact] - impactOrder[a.impact];
        }
        return b.confidence - a.confidence;
      });
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const getIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'optimization': return Lightbulb;
      case 'recognition': return TrendingUp;
      case 'scheduling': return Calendar;
      case 'compliance': return AlertTriangle;
      case 'growth': return Target;
      default: return Lightbulb;
    }
  };

  const getImpactColor = (impact: SmartSuggestion['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            🧸 Appies Smart Suggestions
          </CardTitle>
          <CardDescription>
            AI-powered recommendations based on your data patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>All systems optimized! Check back later for new suggestions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          🧸 Appies Smart Suggestions
        </CardTitle>
        <CardDescription>
          AI-powered recommendations based on your data patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.slice(0, 3).map((suggestion) => {
            const IconComponent = getIcon(suggestion.type);
            return (
              <div 
                key={suggestion.id} 
                className="p-4 rounded-lg border bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-full bg-primary/10">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{suggestion.title}</h4>
                        <Badge className={getImpactColor(suggestion.impact)}>
                          {suggestion.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(suggestion.actionLink)}
                        >
                          {suggestion.actionText}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {suggestions.length > 3 && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/insights')}
            >
              View All {suggestions.length} Suggestions
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}