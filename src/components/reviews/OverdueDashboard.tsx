import React from 'react';
import { useOverdueReviews } from '@/lib/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, User, Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface OverdueDashboardProps {
  className?: string;
  onContactStaff?: (staffId: string) => void;
  onRescheduleReview?: (reviewId: string) => void;
}

interface OverdueReview {
  id: string;
  staff_id: string;
  full_name: string;
  position?: string;
  review_type: string;
  due_date: string;
  days_overdue: number;
  reviewer_id?: string;
  reviewer_name?: string;
}

const getUrgencyLevel = (daysOverdue: number) => {
  if (daysOverdue >= 30) return 'critical';
  if (daysOverdue >= 14) return 'high';
  if (daysOverdue >= 7) return 'medium';
  return 'low';
};

const urgencyConfig = {
  critical: {
    color: 'bg-red-600',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Critical',
    description: '30+ days overdue'
  },
  high: {
    color: 'bg-red-500',
    textColor: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'High',
    description: '14+ days overdue'
  },
  medium: {
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Medium',
    description: '7+ days overdue'
  },
  low: {
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Low',
    description: '1-6 days overdue'
  }
};

export function OverdueDashboard({
  className,
  onContactStaff,
  onRescheduleReview
}: OverdueDashboardProps) {
  const { data: overdueReviews = [], isLoading, error } = useOverdueReviews();

  const getUrgencyStats = () => {
    const stats = overdueReviews.reduce((acc: Record<string, number>, review: OverdueReview) => {
      const urgency = getUrgencyLevel(review.days_overdue);
      acc[urgency] = (acc[urgency] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(urgencyConfig).map(([key, config]) => ({
      key,
      label: config.label,
      description: config.description,
      count: stats[key] || 0,
      color: config.color,
      textColor: config.textColor
    }));
  };

  const sortedReviews = [...overdueReviews].sort((a: OverdueReview, b: OverdueReview) =>
    b.days_overdue - a.days_overdue
  );

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load overdue reviews</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Overdue Reviews Dashboard
          </CardTitle>
          <Badge variant="destructive" className="font-bold">
            {overdueReviews.length} Overdue
          </Badge>
        </div>

        {/* Urgency Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {getUrgencyStats().map((stat) => (
            <div
              key={stat.key}
              className={`p-3 rounded-lg border ${stat.key === 'critical' ? 'ring-2 ring-red-500 ring-opacity-50' : ''}`}
              style={{
                backgroundColor: urgencyConfig[stat.key as keyof typeof urgencyConfig].bgColor,
                borderColor: urgencyConfig[stat.key as keyof typeof urgencyConfig].borderColor
              }}
            >
              <div className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.count}
              </div>
              <div className={`text-sm font-medium ${stat.textColor}`}>
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : overdueReviews.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-600 mb-2">All Caught Up!</h3>
            <p className="text-sm text-muted-foreground">
              No overdue reviews found. Great job staying on top of performance management!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedReviews.map((review: OverdueReview) => {
              const urgency = getUrgencyLevel(review.days_overdue);
              const config = urgencyConfig[urgency as keyof typeof urgencyConfig];

              return (
                <div
                  key={review.id}
                  className={`
                    p-4 rounded-lg border transition-all hover:shadow-md
                    ${config.bgColor} ${config.borderColor}
                    ${urgency === 'critical' ? 'ring-2 ring-red-500 ring-opacity-30' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${config.color} text-white`}>
                        <User className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {review.full_name}
                          </h4>
                          <Badge variant="outline" className={config.textColor}>
                            {config.label}
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {review.review_type} Review
                            </span>
                            {review.position && (
                              <span>{review.position}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`font-medium ${config.textColor}`}>
                              {review.days_overdue} days overdue
                            </span>
                            <span>
                              Due: {format(new Date(review.due_date), 'MMM d, yyyy')}
                            </span>
                            {review.reviewer_name && (
                              <span>
                                Reviewer: {review.reviewer_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onContactStaff?.(review.staff_id)}
                        className="h-8"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Contact
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => onRescheduleReview?.(review.id)}
                        className="h-8"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Reschedule
                      </Button>
                    </div>
                  </div>

                  {/* Progress indicator for severity */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all ${config.color}`}
                        style={{
                          width: `${Math.min((review.days_overdue / 60) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Action Summary */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {overdueReviews.filter((r: OverdueReview) => getUrgencyLevel(r.days_overdue) === 'critical').length}
                  </div>
                  <div className="text-muted-foreground">Need immediate attention</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-amber-600">
                    {overdueReviews.filter((r: OverdueReview) => r.days_overdue >= 7).length}
                  </div>
                  <div className="text-muted-foreground">Over 1 week overdue</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {new Set(overdueReviews.map((r: OverdueReview) => r.reviewer_id)).size}
                  </div>
                  <div className="text-muted-foreground">Reviewers involved</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}