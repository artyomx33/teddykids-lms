import React, { useState } from 'react';
import { useReviewCalendar } from '@/lib/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';

interface ReviewCalendarProps {
  className?: string;
  staffId?: string;
}

type CalendarEvent = {
  event_id: string;
  event_date: string;
  event_day?: string;
  event_type: string;
  label: string;
  description?: string;
  color?: string;
  metadata?: Record<string, any>;
};

type ColorKey = keyof typeof COLOR_CONFIG;

const EVENT_MAPPING: Record<string, { color: ColorKey; label?: string; labelSuffix?: string }> = {
  review_completed: { color: 'green', labelSuffix: ' (Completed)' },
  review_scheduled: { color: 'amber', labelSuffix: ' (Scheduled)' },
  review_warning: { color: 'red', labelSuffix: ' (Critical)' },
  contract_event: { color: 'purple', label: 'Contract Event' },
};

type NormalizedEvent = CalendarEvent & {
  colorKey: ColorKey;
  displayLabel: string;
  eventDay?: string;
  formattedDay?: string;
};

const COLOR_CONFIG = {
  green: {
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    label: 'Completed',
    icon: Calendar
  },
  amber: {
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Scheduled',
    icon: Clock
  },
  red: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Critical',
    icon: AlertTriangle
  },
  purple: {
    color: 'bg-violet-500',
    textColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    label: 'Contract',
    icon: Calendar
  }
};

export function ReviewCalendar({ className, staffId }: ReviewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = format(currentDate, 'MM');
  const currentYear = currentDate.getFullYear();

  const { data: events = [], isLoading, error } = useReviewCalendar(currentMonth, currentYear, staffId);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const normalizeEvents: NormalizedEvent[] = events.map((event) => {
    const explicitColor = event.color && COLOR_CONFIG[event.color as ColorKey] ? (event.color as ColorKey) : undefined;
    const mapping = EVENT_MAPPING[event.event_type];
    const colorKey = explicitColor ?? (mapping && COLOR_CONFIG[mapping.color] ? mapping.color : 'purple');
    const baseLabel = event.label ?? mapping?.label ?? 'Timeline Event';
    const displayLabel = mapping?.labelSuffix ? `${baseLabel}${mapping.labelSuffix}` : baseLabel;
    const eventDay = event.event_day ? event.event_day : (event.event_date ? format(parseISO(event.event_date), 'yyyy-MM-dd') : undefined);
    const formattedDay = eventDay ? format(parseISO(eventDay), 'MMM d, yyyy') : undefined;

    return {
      ...event,
      colorKey,
      displayLabel,
      eventDay,
      formattedDay,
    };
  });

  const getEventsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return normalizeEvents.filter((event) => event.eventDay === dateKey);
  };

  const legendStats = Object.entries(COLOR_CONFIG).map(([key, config]) => ({
    key,
    label: config.label,
    count: normalizeEvents.filter((event) => event.colorKey === key).length,
    color: config.color,
    textColor: config.textColor,
  }));

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

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {legendStats.map((stat) => (
            <div key={stat.key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <span className={`text-sm font-medium ${stat.textColor}`}>
                {stat.label} ({stat.count})
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
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-muted-foreground mb-1">No events this month</p>
          <p className="text-xs text-muted-foreground">
            Reviews and timeline events will appear here once scheduled or completed.
          </p>
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
                      {dayEvents.slice(0, 3).map((event) => {
                        const config = COLOR_CONFIG[event.colorKey];
                        const displayLabel = event.displayLabel;
                        return (
                          <div
                            key={event.event_id}
                            className={`text-xs p-1 rounded cursor-pointer border ${config.bgColor} ${config.textColor} ${config.borderColor} transition-all hover:scale-105 flex items-center gap-1`}
                            title={event.description || displayLabel}
                          >
                            <span className={`w-2 h-2 rounded-full ${config.color}`} />
                            <span className="truncate">{displayLabel}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upcoming Reviews List */}
                  {normalizeEvents.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Upcoming Reviews This Month</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                        {normalizeEvents.slice(0, 20).map((event) => {
                          const config = COLOR_CONFIG[event.colorKey];
                          const Icon = config.icon;

                          return (
                            <div key={event.event_id} className={`flex items-center justify-between p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                              <div className="flex items-center gap-3">
                                <Icon className={`h-4 w-4 ${config.textColor}`} />
                                <div>
                                  <div className="font-medium text-sm">{event.displayLabel}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {event.description || event.formattedDay || ''}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className={`${config.textColor} border-current`}>
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