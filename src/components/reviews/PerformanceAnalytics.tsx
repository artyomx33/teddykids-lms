import React, { useState } from 'react';
import { useStaffReviewSummary, usePerformanceTrends } from '@/lib/hooks/useReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter
} from "lucide-react";

interface StaffSummary {
  staff_id: string;
  full_name: string;
  department?: string;
  location?: string;
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

  const { data: allStaffSummary = [], isLoading: summaryLoading } = useStaffReviewSummary();
  const { data: performanceTrends = [], isLoading: trendsLoading } = usePerformanceTrends(selectedStaffId);

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
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
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
                                      {ratingChange > 0 ? '+' : ''}{ratingChange.toFixed(1)} from prev
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
    </div>
  );
}