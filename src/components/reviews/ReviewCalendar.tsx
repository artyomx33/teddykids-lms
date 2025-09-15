import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";

interface ReviewEvent {
  id: string;
  staffName: string;
  reviewType: "6-month" | "annual" | "probation" | "performance";
  date: Date;
  status: "scheduled" | "overdue" | "completed";
  manager: string;
}

// Mock data for calendar events
const mockReviews: ReviewEvent[] = [
  { id: "1", staffName: "Sarah Johnson", reviewType: "6-month", date: new Date(2024, 2, 15), status: "scheduled", manager: "Mike Chen" },
  { id: "2", staffName: "Alex Rodriguez", reviewType: "annual", date: new Date(2024, 2, 18), status: "overdue", manager: "Lisa Wang" },
  { id: "3", staffName: "Emma Thompson", reviewType: "probation", date: new Date(2024, 2, 22), status: "scheduled", manager: "David Kim" },
  { id: "4", staffName: "James Wilson", reviewType: "6-month", date: new Date(2024, 2, 25), status: "completed", manager: "Sofia Martinez" },
  { id: "5", staffName: "Lisa Chen", reviewType: "annual", date: new Date(2024, 2, 28), status: "scheduled", manager: "Tom Anderson" },
];

interface ReviewCalendarProps {
  onScheduleReview?: (date: Date) => void;
  onReviewClick?: (review: ReviewEvent) => void;
}

export function ReviewCalendar({ onScheduleReview, onReviewClick }: ReviewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getReviewsForDate = (date: Date) => {
    return mockReviews.filter(review => isSameDay(review.date, date));
  };

  const getStatusColor = (status: ReviewEvent['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'overdue': return 'destructive';
      case 'scheduled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: ReviewEvent['reviewType']) => {
    switch (type) {
      case 'annual': return '📅';
      case '6-month': return '⏰';
      case 'probation': return '🎯';
      case 'performance': return '⭐';
      default: return '📝';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Review Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map(day => {
            const dayReviews = getReviewsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] p-1 border rounded-md cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/10 border-primary' :
                  isToday(day) ? 'bg-success/10 border-success' :
                  isCurrentMonth ? 'hover:bg-muted/50' : 'opacity-50'
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday(day) ? 'text-success' : 
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
                
                {/* Review events */}
                <div className="space-y-1">
                  {dayReviews.slice(0, 2).map(review => (
                    <div
                      key={review.id}
                      className={`px-1 py-0.5 rounded text-xs cursor-pointer hover:opacity-80 ${
                        review.status === 'overdue' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                        review.status === 'completed' ? 'bg-success/10 text-success border border-success/20' :
                        'bg-primary/10 text-primary border border-primary/20'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReviewClick?.(review);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{getTypeIcon(review.reviewType)}</span>
                        <span className="truncate">{review.staffName}</span>
                      </div>
                    </div>
                  ))}
                  {dayReviews.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayReviews.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h4>
              <Button
                size="sm"
                onClick={() => onScheduleReview?.(selectedDate)}
                className="bg-gradient-primary"
              >
                <Plus className="w-4 h-4 mr-1" />
                Schedule Review
              </Button>
            </div>

            {getReviewsForDate(selectedDate).length > 0 ? (
              <div className="space-y-2">
                {getReviewsForDate(selectedDate).map(review => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-3 bg-background rounded-md border hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => onReviewClick?.(review)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getTypeIcon(review.reviewType)}</span>
                      <div>
                        <p className="font-medium">{review.staffName}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.reviewType.charAt(0).toUpperCase() + review.reviewType.slice(1)} Review • {review.manager}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(review.status) as any}>
                      {review.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No reviews scheduled for this date
              </p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-success/20 border border-success/40"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/20 border border-primary/40"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/40"></div>
              <span>Overdue</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}