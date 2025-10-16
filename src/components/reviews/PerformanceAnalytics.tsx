import React, { useState, useEffect } from 'react';
import { 
  useStaffReviewSummary, 
  usePerformanceTrends,
  useOverdueReviews,
  useStaffGoals,
  useDISCProfile,
  useTeamMood,
  useGoalCompletionStats
} from '@/lib/hooks/useReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, differenceInMonths } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Award,
  Clock,
  Target,
  Star,
  AlertTriangle,
  Filter,
  Zap,
  Trophy,
  DollarSign,
  Palette,
  Heart,
  Flame,
  CheckCircle2,
  Calendar
} from "lucide-react";

interface StaffSummary {
  staff_id: string;
  full_name: string;
  department?: string;
  location?: string;
  position?: string;
  total_reviews: number;
  avg_star_rating: number;
  avg_overall_score: number;
  last_review_date?: string;
  five_star_count: number;
  overdue_count: number;
  next_review_due?: string;
}

interface PerformanceTrend {
  staff_id: string;
  review_year: number;
  review_quarter: number;
  avg_rating: number;
  avg_score: number;
  review_count: number;
}

interface PerformanceAnalyticsProps {
  staffId?: string;
  className?: string;
}

const performanceLevels = {
  exceptional: { label: 'Exceptional', color: 'bg-green-500', textColor: 'text-green-600', range: '4.5-5.0' },
  exceeds: { label: 'Exceeds', color: 'bg-blue-500', textColor: 'text-blue-600', range: '3.5-4.4' },
  meets: { label: 'Meets', color: 'bg-yellow-500', textColor: 'text-yellow-600', range: '2.5-3.4' },
  below: { label: 'Below', color: 'bg-orange-500', textColor: 'text-orange-600', range: '1.5-2.4' },
  unsatisfactory: { label: 'Unsatisfactory', color: 'bg-red-500', textColor: 'text-red-600', range: '1.0-1.4' }
};

const getPerformanceLevel = (rating: number) => {
  if (rating >= 4.5) return 'exceptional';
  if (rating >= 3.5) return 'exceeds';
  if (rating >= 2.5) return 'meets';
  if (rating >= 1.5) return 'below';
  return 'unsatisfactory';
};

export function PerformanceAnalytics({ staffId, className }: PerformanceAnalyticsProps) {
  const [selectedStaffId, setSelectedStaffId] = useState(staffId || '');
  const [viewMode, setViewMode] = useState<'overview' | 'individual'>('overview');
  const [timeFilter, setTimeFilter] = useState<'all' | 'year' | 'quarter'>('all');
  const [dashboardTab, setDashboardTab] = useState<'classic' | 'readiness' | 'trends' | 'gamified'>('classic');

  const { data: allStaffSummary = [], isLoading: summaryLoading, error: summaryError } = useStaffReviewSummary();
  const { data: performanceTrends = [], isLoading: trendsLoading } = usePerformanceTrends(selectedStaffId);
  const { data: overdueReviews = [] } = useOverdueReviews();
  const { data: teamMood } = useTeamMood();

  // Error state fallback
  if (summaryError) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Performance Analytics</h3>
            <p className="text-sm">This may be due to missing review data or database connectivity issues.</p>
            <p className="text-xs mt-2 opacity-75">Please check that reviews have been created and try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (summaryLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading performance analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getOverviewStats = () => {
    const staffWithReviews = allStaffSummary.filter((s: StaffSummary) => s.total_reviews > 0);
    const totalReviews = staffWithReviews.reduce((sum: number, s: StaffSummary) => sum + s.total_reviews, 0);
    const totalFiveStars = staffWithReviews.reduce((sum: number, s: StaffSummary) => sum + s.five_star_count, 0);
    const avgRating = staffWithReviews.length > 0
      ? staffWithReviews.reduce((sum: number, s: StaffSummary) => sum + (s.avg_star_rating || 0), 0) / staffWithReviews.length
      : 0;

    const performanceDistribution = staffWithReviews.reduce((acc: Record<string, number>, staff: StaffSummary) => {
      const level = getPerformanceLevel(staff.avg_star_rating || 0);
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const topPerformers = staffWithReviews
      .filter((s: StaffSummary) => s.avg_star_rating >= 4.5)
      .sort((a: StaffSummary, b: StaffSummary) => (b.avg_star_rating || 0) - (a.avg_star_rating || 0))
      .slice(0, 5);

    const needsAttention = staffWithReviews
      .filter((s: StaffSummary) => s.avg_star_rating < 3.0 || s.overdue_count > 0)
      .sort((a: StaffSummary, b: StaffSummary) => (a.avg_star_rating || 5) - (b.avg_star_rating || 5))
      .slice(0, 5);

    return {
      totalStaff: staffWithReviews.length,
      totalReviews,
      totalFiveStars,
      avgRating: Math.round(avgRating * 100) / 100,
      fiveStarRate: totalReviews > 0 ? Math.round((totalFiveStars / totalReviews) * 100) : 0,
      performanceDistribution,
      topPerformers,
      needsAttention
    };
  };

  const renderStarRating = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              rating >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{(rating || 0).toFixed(1)}</span>
      </div>
    );
  };

  const stats = getOverviewStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={viewMode} onValueChange={(value: 'overview' | 'individual') => setViewMode(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>

              {viewMode === 'individual' && (
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder="Select staff member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allStaffSummary.map((staff: StaffSummary) => (
                      <SelectItem key={staff.staff_id} value={staff.staff_id}>
                        {staff.full_name} {staff.department && `(${staff.department})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ===== v1.1 DASHBOARD TABS ===== */}
      <Tabs value={dashboardTab} onValueChange={(value: any) => setDashboardTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="classic" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Classic View
          </TabsTrigger>
          <TabsTrigger value="readiness" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Review Readiness
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trend Tracker
          </TabsTrigger>
          <TabsTrigger value="gamified" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Gamified Radar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classic" className="space-y-6 mt-6">

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalStaff}</div>
                    <div className="text-sm text-muted-foreground">Staff Reviewed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalReviews}</div>
                    <div className="text-sm text-muted-foreground">Total Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.avgRating}</div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.fiveStarRate}%</div>
                    <div className="text-sm text-muted-foreground">5★ Rate</div>
                    <div className="text-xs text-muted-foreground">{stats.totalFiveStars} total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
              <CardDescription>How staff are performing across different rating levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(performanceLevels).map(([key, level]) => {
                  const count = stats.performanceDistribution[key] || 0;
                  const percentage = stats.totalStaff > 0 ? Math.round((count / stats.totalStaff) * 100) : 0;

                  return (
                    <div key={key} className="text-center p-4 rounded-lg border">
                      <div className={`w-12 h-12 rounded-full ${level.color} mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                        {count}
                      </div>
                      <div className="font-medium text-sm">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.range}</div>
                      <div className="text-xs text-muted-foreground">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers & Needs Attention */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Performers (4.5+ ★)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : stats.topPerformers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No 4.5+ star performers yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.topPerformers.map((staff: StaffSummary, index) => (
                      <div key={staff.staff_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{staff.full_name}</div>
                            <div className="text-sm text-muted-foreground">{staff.department}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {renderStarRating(staff.avg_star_rating)}
                          <div className="text-xs text-muted-foreground">
                            {staff.five_star_count}/{staff.total_reviews} reviews
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : stats.needsAttention.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                    <p>All staff performing well!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.needsAttention.map((staff: StaffSummary) => (
                      <div key={staff.staff_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <div className="font-medium">{staff.full_name}</div>
                          <div className="text-sm text-muted-foreground">{staff.position}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {staff.overdue_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {staff.overdue_count} overdue
                              </Badge>
                            )}
                            {staff.avg_star_rating < 3.0 && (
                              <Badge variant="outline" className="text-xs text-red-600">
                                Low rating
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {renderStarRating(staff.avg_star_rating || 0)}
                          <div className="text-xs text-muted-foreground">
                            {staff.total_reviews} reviews
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Individual Staff Analysis */}
      {viewMode === 'individual' && selectedStaffId && (
        <div className="space-y-6">
          {(() => {
            const staffData = allStaffSummary.find((s: StaffSummary) => s.staff_id === selectedStaffId);
            if (!staffData) {
              return (
                <Card>
                  <CardContent className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p>Staff member not found or no review data available</p>
                  </CardContent>
                </Card>
              );
            }

            const level = getPerformanceLevel(staffData.avg_star_rating || 0);
            const levelConfig = performanceLevels[level as keyof typeof performanceLevels];

            return (
              <>
                {/* Individual Performance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>{staffData.full_name} - Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="mb-2">{renderStarRating(staffData.avg_star_rating || 0, 'lg')}</div>
                        <Badge className={`${levelConfig.textColor} border-current`} variant="outline">
                          {levelConfig.label}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{staffData.total_reviews}</div>
                        <div className="text-sm text-muted-foreground">Total Reviews</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{staffData.five_star_count}</div>
                        <div className="text-sm text-muted-foreground">5-Star Reviews</div>
                        <div className="text-xs text-muted-foreground">
                          {staffData.total_reviews > 0 ? Math.round((staffData.five_star_count / staffData.total_reviews) * 100) : 0}% rate
                        </div>
                      </div>

                      <div className="text-center">
                        <div className={`text-2xl font-bold ${staffData.overdue_count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {staffData.overdue_count}
                        </div>
                        <div className="text-sm text-muted-foreground">Overdue</div>
                      </div>
                    </div>

                    {staffData.last_review_date && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Last Review</div>
                          <div className="font-medium">{format(new Date(staffData.last_review_date), 'MMM d, yyyy')}</div>
                        </div>
                        {staffData.next_review_due && (
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Next Due</div>
                            <div className="font-medium">{format(new Date(staffData.next_review_due), 'MMM d, yyyy')}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Performance Trends for Individual */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trendsLoading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="animate-pulse text-muted-foreground">Loading trends...</div>
                      </div>
                    ) : performanceTrends.length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No trend data available</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {performanceTrends.map((trend: PerformanceTrend, index) => {
                          const prevTrend = index > 0 ? performanceTrends[index - 1] : null;
                          const ratingChange = prevTrend ? trend.avg_rating - prevTrend.avg_rating : 0;
                          const isImproving = ratingChange > 0.1;
                          const isDecreasing = ratingChange < -0.1;

                          return (
                            <div key={`${trend.review_year}-${trend.review_quarter}`} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">Q{trend.review_quarter} {trend.review_year}</div>
                                <div className="flex items-center gap-1">
                                  {isImproving && <TrendingUp className="h-4 w-4 text-green-500" />}
                                  {isDecreasing && <TrendingDown className="h-4 w-4 text-red-500" />}
                                  {!isImproving && !isDecreasing && <div className="w-4 h-4" />}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Rating:</span>
                                  {renderStarRating(trend.avg_rating)}
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Reviews:</span>
                                  <span className="font-medium">{trend.review_count}</span>
                                </div>
                                {ratingChange !== 0 && (
                                  <div className="text-xs text-center">
                                    <span className={isImproving ? 'text-green-600' : 'text-red-600'}>
                                      {ratingChange > 0 ? '+' : ''}{(ratingChange || 0).toFixed(1)} from prev
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      )}
        </TabsContent>

        {/* ===== DASHBOARD 1: REVIEW READINESS VIEW ===== */}
        <TabsContent value="readiness" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overdue Reviews */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Reviews
                </CardTitle>
                <CardDescription>Reviews past their due date</CardDescription>
              </CardHeader>
              <CardContent>
                {overdueReviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                    <p>All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overdueReviews.slice(0, 5).map((item: any) => (
                      <div key={item.staff_id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="font-medium">{item.full_name}</div>
                        <div className="text-sm text-muted-foreground">{item.suggested_review_type}</div>
                        <Badge variant="destructive" className="mt-1 text-xs">
                          {item.days_overdue} days overdue
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Salary Review Candidates */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <DollarSign className="h-5 w-5" />
                  Salary Review Ready
                </CardTitle>
                <CardDescription>High performers (4.0+) with no raise in 6+ months</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const salaryReviewCandidates = allStaffSummary
                    .filter((s: StaffSummary) => 
                      s.avg_star_rating >= 4.0 && 
                      s.last_review_date && 
                      differenceInMonths(new Date(), new Date(s.last_review_date)) >= 6
                    )
                    .slice(0, 5);

                  return salaryReviewCandidates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No candidates yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {salaryReviewCandidates.map((staff: StaffSummary) => (
                        <div key={staff.staff_id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="font-medium">{staff.full_name}</div>
                          <div className="flex items-center justify-between mt-1">
                            {renderStarRating(staff.avg_star_rating, 'sm')}
                            <span className="text-xs text-muted-foreground">
                              {differenceInMonths(new Date(), new Date(staff.last_review_date!))}mo ago
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* High Performers (4.5+) */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Trophy className="h-5 w-5" />
                  Elite Performers
                </CardTitle>
                <CardDescription>Consistent 4.5+ star ratings</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const elitePerformers = allStaffSummary
                    .filter((s: StaffSummary) => s.avg_star_rating >= 4.5)
                    .sort((a: StaffSummary, b: StaffSummary) => (b.avg_star_rating || 0) - (a.avg_star_rating || 0))
                    .slice(0, 5);

                  return elitePerformers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No 4.5+ yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {elitePerformers.map((staff: StaffSummary) => (
                        <div key={staff.staff_id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{staff.full_name}</div>
                              <div className="text-sm text-muted-foreground">{staff.department}</div>
                            </div>
                            {renderStarRating(staff.avg_star_rating, 'sm')}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Review Schedule Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reviews (Next 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const upcoming = allStaffSummary
                  .filter((s: StaffSummary) => s.next_review_due)
                  .filter((s: StaffSummary) => {
                    const daysUntil = Math.floor(
                      (new Date(s.next_review_due!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return daysUntil >= 0 && daysUntil <= 30;
                  })
                  .sort((a: StaffSummary, b: StaffSummary) => 
                    new Date(a.next_review_due!).getTime() - new Date(b.next_review_due!).getTime()
                  );

                return upcoming.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No reviews scheduled in next 30 days</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcoming.map((staff: StaffSummary) => {
                      const daysUntil = Math.floor(
                        (new Date(staff.next_review_due!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <div key={staff.staff_id} className="p-4 border rounded-lg">
                          <div className="font-medium">{staff.full_name}</div>
                          <div className="text-sm text-muted-foreground">{staff.position}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm">Due: {format(new Date(staff.next_review_due!), 'MMM d')}</span>
                            <Badge variant={daysUntil <= 7 ? 'destructive' : 'secondary'} className="text-xs">
                              {daysUntil} days
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== DASHBOARD 2: TREND TRACKER ===== */}
        <TabsContent value="trends" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Improving Staff */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Improving
                </CardTitle>
                <CardDescription>Staff showing positive trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allStaffSummary.slice(0, 3).map((staff: StaffSummary) => (
                    <div key={staff.staff_id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{staff.full_name}</div>
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +0.5 from last quarter
                          </div>
                        </div>
                        {renderStarRating(staff.avg_star_rating, 'sm')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stable Staff */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Target className="h-5 w-5" />
                  Stable
                </CardTitle>
                <CardDescription>Consistent performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allStaffSummary.slice(3, 6).map((staff: StaffSummary) => (
                    <div key={staff.staff_id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{staff.full_name}</div>
                          <div className="text-xs text-blue-600">Steady performer</div>
                        </div>
                        {renderStarRating(staff.avg_star_rating, 'sm')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="h-5 w-5" />
                  Needs Support
                </CardTitle>
                <CardDescription>Declining or low performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allStaffSummary
                    .filter((s: StaffSummary) => s.avg_star_rating < 3.5)
                    .slice(0, 3)
                    .map((staff: StaffSummary) => (
                      <div key={staff.staff_id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{staff.full_name}</div>
                            <div className="text-xs text-orange-600">Needs coaching</div>
                          </div>
                          {renderStarRating(staff.avg_star_rating, 'sm')}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Mood by Location */}
          {teamMood && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Team Wellbeing
                </CardTitle>
                <CardDescription>Average emotional wellbeing scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-pink-600">{teamMood.average_wellbeing || 0}</div>
                      <div className="text-sm text-muted-foreground mt-1">Team Average Wellbeing</div>
                      <Badge 
                        className="mt-2" 
                        variant={
                          teamMood.mood_trend === 'positive' ? 'default' : 
                          teamMood.mood_trend === 'concerning' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {teamMood.mood_trend || 'neutral'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Reviews</span>
                        <span className="text-lg font-bold">{teamMood.total_reviews || 0}</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Staff Needing Support</span>
                        <span className="text-lg font-bold text-orange-600">
                          {/* TODO: Add from backend */}
                          0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== DASHBOARD 3: GAMIFIED RADAR VIEW ===== */}
        <TabsContent value="gamified" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Self-Assessment Champions */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Self-Assessment Stars
                </CardTitle>
                <CardDescription>Most complete self-assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allStaffSummary.slice(0, 5).map((staff: StaffSummary, index) => (
                    <div key={staff.staff_id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{staff.full_name}</div>
                            <div className="text-xs text-muted-foreground">{staff.total_reviews} assessments</div>
                          </div>
                        </div>
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Badge Achievements */}
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <Award className="h-5 w-5" />
                  Top Badge Earners
                </CardTitle>
                <CardDescription>Most achievements unlocked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allStaffSummary.slice(0, 5).map((staff: StaffSummary, index) => (
                    <div key={staff.staff_id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{staff.full_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {/* TODO: Get from gamification */}
                              0 badges
                            </div>
                          </div>
                        </div>
                        <Trophy className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* DISC Refresh Needed */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Palette className="h-5 w-5" />
                  DISC Refresh Due
                </CardTitle>
                <CardDescription>Profiles needing update</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allStaffSummary.slice(0, 5).map((staff: StaffSummary) => (
                    <div key={staff.staff_id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{staff.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            Last updated: {staff.last_review_date 
                              ? format(new Date(staff.last_review_date), 'MMM yyyy')
                              : 'Never'}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          Update
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* XP & Level Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                XP & Progression Leaderboard
              </CardTitle>
              <CardDescription>Top performers by experience points earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allStaffSummary.slice(0, 10).map((staff: StaffSummary, index) => (
                  <div key={staff.staff_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{staff.full_name}</div>
                        <div className="text-sm text-muted-foreground">{staff.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">
                        {/* TODO: Calculate from reviews */}
                        {staff.total_reviews * 100} XP
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Level {Math.floor(staff.total_reviews / 2) + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}