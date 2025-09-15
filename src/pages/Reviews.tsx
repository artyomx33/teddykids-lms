import { useState } from "react";
import { Star, Calendar, AlertTriangle, Clock, TrendingUp, Plus, Filter, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { ReviewCalendar } from "@/components/reviews/ReviewCalendar";
import { PerformanceAnalytics } from "@/components/reviews/PerformanceAnalytics";

export default function Reviews() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<{ id: string; name: string; position: string } | undefined>();

  const handleScheduleReview = (date?: Date, staff?: { id: string; name: string; position: string }) => {
    setSelectedStaff(staff);
    setIsReviewModalOpen(true);
  };

  return (
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
            onClick={() => handleScheduleReview()}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Review
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Due This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning font-medium">3 overdue</span>
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
            <div className="text-2xl font-bold text-foreground">4.2</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+0.3 </span>
              from last quarter
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
            <div className="text-2xl font-bold text-foreground">23</div>
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
            <div className="text-2xl font-bold text-foreground">89%</div>
            <p className="text-xs text-muted-foreground">
              On-time reviews
            </p>
          </CardContent>
        </Card>
      </div>

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
                <div className="space-y-3">
                  {/* Placeholder overdue reviews */}
                  {[
                    { name: "Sarah Johnson", type: "6-Month", overdue: "12 days", manager: "Mike Chen" },
                    { name: "Alex Rodriguez", type: "Annual", overdue: "8 days", manager: "Lisa Wang" },
                    { name: "Emma Thompson", type: "Probation", overdue: "5 days", manager: "David Kim" }
                  ].map((review, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{review.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.type} Review • Manager: {review.manager}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive" className="mb-1">
                          {review.overdue} overdue
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-xs">
                            Schedule
                          </Button>
                          <Button 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleScheduleReview(undefined, { 
                              id: `staff-${index}`, 
                              name: review.name, 
                              position: "Staff Member" 
                            })}
                          >
                            Start Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Overdue
                </Button>
              </CardContent>
            </Card>

            {/* Review Calendar */}
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
                  {/* Placeholder upcoming reviews */}
                  {[
                    { name: "James Wilson", date: "Mar 15", type: "6-Month" },
                    { name: "Sofia Martinez", date: "Mar 18", type: "Annual" },
                    { name: "Tom Anderson", date: "Mar 22", type: "6-Month" },
                    { name: "Lisa Chen", date: "Mar 25", type: "Probation" }
                  ].map((review, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                         onClick={() => handleScheduleReview(undefined, { 
                           id: `upcoming-${index}`, 
                           name: review.name, 
                           position: "Staff Member" 
                         })}>
                      <div>
                        <p className="text-sm font-medium">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.type}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {review.date}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <ReviewCalendar 
            onScheduleReview={(date) => handleScheduleReview(date)}
            onReviewClick={(review) => handleScheduleReview(review.date, { 
              id: review.id, 
              name: review.staffName, 
              position: "Staff Member" 
            })}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <PerformanceAnalytics />
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedStaff(undefined);
        }}
        staffMember={selectedStaff}
      />
    </div>
  );
}