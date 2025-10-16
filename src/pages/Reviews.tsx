import { useState } from "react";
import { format } from 'date-fns';
import { Star, Calendar, AlertTriangle, Clock, TrendingUp, Plus, Filter, BarChart3, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewFormDialog } from "@/components/reviews/ReviewFormDialog";
import { ScheduleReviewDialog } from "@/components/reviews/ScheduleReviewDialog";
import { ReviewCalendar } from "@/components/reviews/ReviewCalendar";
import { PerformanceAnalytics } from "@/components/reviews/PerformanceAnalytics";
import { 
  useReviews, 
  useOverdueReviews, 
  useStaffReviewSummary, 
  useReviewCalendar 
} from "@/lib/hooks/useReviews";

// Error Boundaries
import { ErrorBoundary, PageErrorBoundary } from "@/components/error-boundaries/ErrorBoundary";

export default function Reviews() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<{ id: string; name: string; position: string } | undefined>();

  // Fetch real data from database
  const { data: allReviews = [], isLoading: reviewsLoading } = useReviews();
  const { data: overdueReviews = [], isLoading: overdueLoading } = useOverdueReviews();
  const { data: staffSummary = [], isLoading: summaryLoading } = useStaffReviewSummary();

  const currentMonth = format(new Date(), 'MM');
  const currentYear = new Date().getFullYear();
  const { data: upcomingReviews = [] } = useReviewCalendar(currentMonth, currentYear);

  // Calculate real stats from database
  const dueThisMonth = upcomingReviews.filter((r: any) => {
    const dueDate = new Date(r.due_date);
    return dueDate.getMonth() === new Date().getMonth();
  }).length;

  const overdueCount = overdueReviews.length;

  const avgScore = staffSummary.length > 0
    ? staffSummary.reduce((sum: number, s: any) => sum + (s.avg_star_rating || 0), 0) / staffSummary.length
    : 0;

  const fiveStarStaff = staffSummary.filter((s: any) => (s.avg_star_rating || 0) >= 4.5).length;

  const completedReviews = allReviews.filter((r: any) => r.status === 'completed').length;
  const totalReviews = allReviews.length;
  const completionRate = totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0;

  // Trend calculation
  const lastQuarterReviews = allReviews.filter((r: any) => {
    if (!r.review_date) return false;
    const reviewDate = new Date(r.review_date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return reviewDate >= threeMonthsAgo;
  });

  const lastQuarterAvg = lastQuarterReviews.length > 0
    ? lastQuarterReviews.reduce((sum: number, r: any) => sum + (r.star_rating || 0), 0) / lastQuarterReviews.length
    : 0;
  const scoreTrend = avgScore - lastQuarterAvg;

  const handleScheduleReview = (date?: Date, staff?: { id: string; name: string; position: string }) => {
    setSelectedStaff(staff);
    setIsReviewModalOpen(true);
  };

  return (
    <PageErrorBoundary>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff performance reviews and evaluations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter Reviews
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsScheduleDialogOpen(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule for Later
          </Button>
          <Button 
            onClick={() => setIsReviewModalOpen(true)}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Complete Review
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <ErrorBoundary componentName="ReviewStatsCards">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Due This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {summaryLoading ? '...' : dueThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning font-medium">{overdueCount} overdue</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Score
            </CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {summaryLoading ? '...' : avgScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={scoreTrend > 0 ? 'text-success font-medium' : scoreTrend < 0 ? 'text-destructive font-medium' : 'font-medium'}>
                {scoreTrend > 0 ? '+' : ''}{scoreTrend.toFixed(1)}
              </span>
              {' '}from last quarter
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              5★ Staff
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {summaryLoading ? '...' : fiveStarStaff}
            </div>
            <p className="text-xs text-muted-foreground">
              Top performers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {reviewsLoading ? '...' : completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              On-time reviews
            </p>
          </CardContent>
        </Card>
        </div>
      </ErrorBoundary>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Review Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar & Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Overdue Reviews */}
            <ErrorBoundary componentName="OverdueReviews">
              <Card className="lg:col-span-2 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Overdue Reviews
                </CardTitle>
                <CardDescription>
                  Staff reviews that need immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overdueLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : overdueReviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-xs mt-1">No overdue reviews.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {overdueReviews.slice(0, 3).map((review: any) => (
                        <div key={review.staff_id} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">{review.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {review.suggested_review_type} Review
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <Badge variant="destructive">
                              {review.days_overdue} days overdue
                            </Badge>
                            <Button 
                              size="sm" 
                              className="text-xs"
                              onClick={() => {
                                setSelectedStaff({ 
                                  id: review.staff_id, 
                                  name: review.full_name, 
                                  position: 'Staff' 
                                });
                                setIsReviewModalOpen(true);
                              }}
                            >
                              Start Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {overdueReviews.length > 3 && (
                      <Button variant="outline" className="w-full mt-4">
                        View All {overdueReviews.length} Overdue
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
              </Card>
            </ErrorBoundary>

            {/* Review Calendar */}
            <ErrorBoundary componentName="UpcomingReviews">
              <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Reviews
                </CardTitle>
                <CardDescription>
                  Next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingReviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">No reviews scheduled</p>
                      <p className="text-xs mt-1">Next 30 days</p>
                    </div>
                  ) : (
                    upcomingReviews.slice(0, 4).map((review: any) => {
                      const daysUntil = Math.floor(
                        (new Date(review.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const isUrgent = daysUntil <= 7;
                      
                      return (
                        <div 
                          key={review.id || review.staff_id} 
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedStaff({ 
                              id: review.staff_id, 
                              name: review.full_name, 
                              position: 'Staff' 
                            });
                            setIsReviewModalOpen(true);
                          }}
                        >
                          <div>
                            <p className="text-sm font-medium">{review.full_name}</p>
                            <p className="text-xs text-muted-foreground">{review.review_type || 'Review'}</p>
                          </div>
                          <Badge variant={isUrgent ? "destructive" : "outline"} className="text-xs">
                            {daysUntil} days
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Calendar
                </Button>
              </CardContent>
              </Card>
            </ErrorBoundary>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <ErrorBoundary componentName="ReviewCalendar">
            <ReviewCalendar />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="analytics">
          <ErrorBoundary componentName="PerformanceAnalytics">
            <PerformanceAnalytics />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>

      {/* Review Form Dialog */}
      <ReviewFormDialog
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedStaff(undefined);
        }}
        staffId={selectedStaff?.id}
        mode="create"
      />

      {/* Schedule Review Dialog */}
      <ScheduleReviewDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => {
          setIsScheduleDialogOpen(false);
          setSelectedStaff(undefined);
        }}
        staffId={selectedStaff?.id}
        staffName={selectedStaff?.name}
      />
      </div>
    </PageErrorBoundary>
  );
}