import React, { useState } from 'react';
import { useReviewCalendar } from '@/lib/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

interface ReviewCalendarProps {
  className?: string;
}

interface CalendarEvent {
  id: string;
  staff_id: string;
  full_name: string;
  review_type: string;
  review_date: string;
  due_date: string;
  status: string;
  reviewer_name?: string;
  urgency: 'overdue' | 'due_soon' | 'upcoming';
}

const urgencyConfig = {
  overdue: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Overdue',
    icon: AlertTriangle
  },
  due_soon: {
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Due Soon',
    icon: Clock
  },
  upcoming: {
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Upcoming',
    icon: Calendar
  }
};

export function ReviewCalendar({ className }: ReviewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = format(currentDate, 'MM');
  const currentYear = currentDate.getFullYear();

  const { data: events = [], isLoading, error } = useReviewCalendar(currentMonth, currentYear);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return events.filter((event: CalendarEvent) =>
      event.due_date === dateString || event.review_date === dateString
    );
  };

  const getUrgencyStats = () => {
    const stats = events.reduce((acc: Record<string, number>, event: CalendarEvent) => {
      acc[event.urgency] = (acc[event.urgency] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(urgencyConfig).map(([key, config]) => ({
      key,
      label: config.label,
      count: stats[key] || 0,
      color: config.color,
      textColor: config.textColor
    }));
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load calendar</p>
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
            <Calendar className="h-5 w-5" />
            Review Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="flex gap-4 mt-4">
          {getUrgencyStats().map((stat) => (
            <div key={stat.key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <span className={`text-sm font-medium ${stat.textColor}`}>
                {stat.label}: {stat.count}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((date) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={date.toString()}
                    className={`
                      aspect-square p-1 border rounded-lg relative min-h-[80px]
                      ${isCurrentMonth ? 'bg-background' : 'bg-muted/50'}
                      ${isTodayDate ? 'ring-2 ring-primary' : ''}
                      hover:bg-muted/50 transition-colors
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                      ${isTodayDate ? 'text-primary font-bold' : ''}
                    `}>
                      {format(date, 'd')}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event: CalendarEvent) => {
                        const config = urgencyConfig[event.urgency];
                        return (
                          <div
                            key={event.id}
                            className={`
                              text-xs p-1 rounded truncate cursor-pointer
                              ${config.bgColor} ${config.textColor} ${config.borderColor}
                              border transition-all hover:scale-105
                            `}
                            title={`${event.full_name} - ${event.review_type}`}
                          >
                            {event.full_name}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upcoming Reviews List */}
            {events.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Upcoming Reviews This Month</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {events.slice(0, 10).map((event: CalendarEvent) => {
                    const config = urgencyConfig[event.urgency];
                    const Icon = config.icon;

                    return (
                      <div
                        key={event.id}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border
                          ${config.bgColor} ${config.borderColor}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${config.textColor}`} />
                          <div>
                            <div className="font-medium text-sm">
                              {event.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.review_type} • Due: {format(new Date(event.due_date), 'MMM d')}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={config.textColor}>
                          {config.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}