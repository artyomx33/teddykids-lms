/**
 * EmployeeTimeline Component
 * 
 * Beautiful, visual employment history timeline
 * Shows salary increases, contract changes, and milestones
 * 
 * Phase 4: Timeline System
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  FileText, 
  Award,
  Calendar,
  DollarSign,
  Briefcase,
  ChevronRight,
  Plus,
  MessageSquare,
  Edit3
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { calculateNetSalary } from '@/lib/dutch-tax-calculator';

export interface TimelineEvent {
  id: string;
  event_type: string;
  event_date: string;
  event_description: string;
  salary_at_event: number | null;
  hours_at_event: number | null;
  change_amount: number | null;
  change_percentage: number | null;
  is_milestone: boolean;
  milestone_type: string | null;
  change_reason: string | null;
  previous_value: any;
  new_value: any;
}

interface EmployeeTimelineProps {
  employeeId: string;
  onEventClick?: (event: TimelineEvent) => void;
  onAddComment?: () => void;
  onAddChange?: () => void;
}

export function EmployeeTimeline({ 
  employeeId, 
  onEventClick,
  onAddComment,
  onAddChange
}: EmployeeTimelineProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['employee-timeline', employeeId],
    queryFn: async () => {
      
      const { data, error } = await supabase
        .from('employes_timeline_v2')
        .select('*')
        .eq('employee_id', employeeId)
        .order('event_date', { ascending: false });
      
      if (error) {
        console.error('❌ [EmployeeTimeline] Error:', error);
        throw error;
      }
      
      return data as TimelineEvent[];
    },
    enabled: !!employeeId,
  });

  // Calculate summary stats
  const summary = events ? {
    totalEvents: events.length,
    milestones: events.filter(e => e.is_milestone).length,
    salaryIncreases: events.filter(e => e.event_type === 'salary_increase').length,
    totalGrowth: events
      .filter(e => e.event_type === 'salary_increase')
      .reduce((sum, e) => sum + (e.change_amount || 0), 0),
    avgIncrease: (() => {
      const salaryIncreases = events.filter(e => e.event_type === 'salary_increase' && e.change_percentage);
      if (salaryIncreases.length === 0) return 0;
      return salaryIncreases.reduce((sum, e) => sum + (e.change_percentage || 0), 0) / salaryIncreases.length;
    })(),
  } : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-gray-500">Loading timeline...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No timeline events yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employment Timeline
          </CardTitle>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {onAddComment && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onAddComment}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <MessageSquare className="h-4 w-4" />
                Comment
              </Button>
            )}
            {onAddChange && (
              <Button 
                size="sm" 
                variant="default"
                onClick={onAddChange}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <Edit3 className="h-4 w-4" />
                Add Change
              </Button>
            )}
          </div>
        </div>
        
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-blue-600 font-medium">Total Events</div>
              <div className="text-2xl font-bold text-blue-700">{summary.totalEvents}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-xs text-purple-600 font-medium">Milestones</div>
              <div className="text-2xl font-bold text-purple-700">{summary.milestones}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs text-green-600 font-medium">Salary Increases</div>
              <div className="text-2xl font-bold text-green-700">{summary.salaryIncreases}</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <div className="text-xs text-emerald-600 font-medium">Total Growth</div>
              <div className="text-2xl font-bold text-emerald-700">
                €{summary.totalGrowth.toFixed(0)}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500" />
          
          {/* Events */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <TimelineEventCard 
                key={event.id} 
                event={event} 
                isFirst={index === 0}
                onClick={onEventClick}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineEventCard({ 
  event, 
  isFirst, 
  onClick 
}: { 
  event: TimelineEvent; 
  isFirst: boolean;
  onClick?: (event: TimelineEvent) => void;
}) {
  // Determine icon and colors based on event type
  const getEventStyle = () => {
    switch (event.event_type) {
      case 'salary_increase':
        return {
          icon: TrendingUp,
          color: 'text-green-600',
          bg: 'bg-green-100',
          border: 'border-green-300',
          dotBg: 'bg-green-500',
        };
      case 'salary_decrease':
        return {
          icon: TrendingDown,
          color: 'text-red-600',
          bg: 'bg-red-100',
          border: 'border-red-300',
          dotBg: 'bg-red-500',
        };
      case 'contract_change':
        return {
          icon: FileText,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          dotBg: 'bg-blue-500',
        };
      case 'hours_change':
        return {
          icon: Clock,
          color: 'text-purple-600',
          bg: 'bg-purple-100',
          border: 'border-purple-300',
          dotBg: 'bg-purple-500',
        };
      default:
        return {
          icon: Briefcase,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          dotBg: 'bg-gray-500',
        };
    }
  };

  const style = getEventStyle();
  const Icon = style.icon;

  return (
    <div className="relative pl-16">
      {/* Timeline dot */}
      <div className={`absolute left-6 top-3 w-5 h-5 rounded-full ${style.dotBg} border-4 border-white shadow-lg z-10`}>
        {event.is_milestone && (
          <div className="absolute -top-1 -right-1">
            <Award className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          </div>
        )}
      </div>
      
      {/* Event card */}
      <div 
        className={`border-2 ${style.border} rounded-lg p-4 ${style.bg} transition-all hover:shadow-lg hover:scale-[1.02] ${onClick ? 'cursor-pointer' : ''}`}
        onClick={() => onClick?.(event)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={`h-5 w-5 ${style.color} mt-0.5`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold ${style.color}`}>
                  {event.event_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </h4>
                {event.is_milestone && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Award className="h-3 w-3 mr-1" />
                    Milestone
                  </Badge>
                )}
                {isFirst && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Latest
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {event.event_description}
              </p>
              
              {/* Enhanced Salary Details Grid - Show for ALL events with salary data */}
              {event.salary_at_event != null && event.salary_at_event > 0 && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-lg border mb-2">
                  {/* Bruto */}
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Bruto</div>
                    <div className="text-sm font-bold text-blue-600">
                      €{event.salary_at_event.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-400">per month</div>
                  </div>
                  
                  {/* Neto (estimated) */}
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Neto ~</div>
                    <div className="text-sm font-bold text-green-600">
                      €{calculateNetSalary(event.salary_at_event).netMonthly.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-400">estimated</div>
                  </div>
                  
                  {/* Hours - Show even if null for contract events */}
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Hours</div>
                    <div className="text-sm font-bold text-purple-600">
                      {event.hours_at_event ? `${event.hours_at_event}h` : '-'}
                    </div>
                    <div className="text-xs text-gray-400">per week</div>
                  </div>
                </div>
              )}
              
              {/* Change details */}
              {event.change_amount != null && event.change_amount !== 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <div className={`font-semibold ${event.change_amount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {event.change_amount > 0 ? '+' : ''}€{Math.abs(event.change_amount).toFixed(0)}
                  </div>
                  {event.change_percentage != null && (
                    <div className={`font-medium ${event.change_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({event.change_amount > 0 ? '+' : ''}{event.change_percentage.toFixed(1)}%)
                    </div>
                  )}
                </div>
              )}
              
              {/* Change reason */}
              {event.change_reason && (
                <div className="mt-2 text-xs text-gray-600 italic">
                  {event.change_reason}
                </div>
              )}
            </div>
          </div>
          
          {/* Date */}
          <div className="text-right ml-4 flex items-center gap-2">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {format(new Date(event.event_date), 'MMM d, yyyy')}
              </div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(event.event_date), { addSuffix: true })}
              </div>
            </div>
            {onClick && (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
