/**
 * EmployeeTimeline Component
 * 
 * Beautiful, visual employment history timeline
 * Shows salary increases, contract changes, and milestones
 * 
 * Phase 4: Timeline System
 */

import { useState } from 'react';
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
import { ManualTimelineEventDialog } from './ManualTimelineEventDialog';
// Note: calculateNetSalary and timeline-data-extractor imports removed
// We now use complete state data directly from the database!

// 🎯 NEW: CompleteStateGrid Component
interface CompleteStateGridProps {
  event: TimelineEvent;
  isFirst?: boolean;
}

function CompleteStateGrid({ event, isFirst }: CompleteStateGridProps) {
  // Use the beautiful complete state data directly!
  const monthlyWage = event.month_wage_at_event;
  const hoursPerWeek = event.hours_per_week_at_event;
  const annualSalary = event.annual_salary_at_event;
  const netMonthly = event.net_monthly_at_event;

  // Context information
  const role = event.role_at_event;
  const department = event.department_at_event;
  const contractType = event.contract_type_at_event;
  const employmentType = event.employment_type_at_event;

  // Show if we have any salary data
  if (!monthlyWage && !hoursPerWeek) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* 💰 Salary & Hours Grid - Just like your beautiful screenshot! */}
      {monthlyWage && (
        <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-lg border">
          {/* Monthly Salary */}
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Monthly Salary</div>
            <div className="text-lg font-bold text-green-600">
              €{monthlyWage.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">gross</div>
          </div>

          {/* Net Monthly */}
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Net Monthly</div>
            <div className="text-lg font-bold text-blue-600">
              €{netMonthly ? netMonthly.toLocaleString() : 'N/A'}
            </div>
            <div className="text-xs text-gray-400">estimated</div>
          </div>

          {/* Hours */}
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Hours</div>
            <div className="text-lg font-bold text-purple-600">
              {hoursPerWeek ? `${hoursPerWeek}h` : '-'}
            </div>
            <div className="text-xs text-gray-400">per week</div>
          </div>
        </div>
      )}

      {/* 📋 Enhanced Contract Context - Show employment details + contract dates */}
      {(role || department || contractType || employmentType || event.contract_start_date) && (
        <div className="space-y-2">
          {/* Role and Department */}
          <div className="flex flex-wrap gap-2">
            {role && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                👤 {role}
              </Badge>
            )}
            {department && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                📍 {department}
              </Badge>
            )}
          </div>

          {/* Contract Information */}
          <div className="flex flex-wrap gap-2">
            {contractType && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                📄 {contractType === 'definite' || contractType === 'fixed' ? 'Fixed-term' : 'Permanent'}
              </Badge>
            )}
            {employmentType && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                ⏰ {employmentType === 'parttime' ? 'Part-time' : 'Full-time'}
              </Badge>
            )}

            {/* Contract Duration */}
            {event.contract_start_date && event.contract_end_date && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                📅 {format(new Date(event.contract_start_date), 'MMM d, yyyy')} → {format(new Date(event.contract_end_date), 'MMM d, yyyy')}
              </Badge>
            )}

            {/* Contract Expiry Warning */}
            {event.contract_end_date && (() => {
              const today = new Date();
              const endDate = new Date(event.contract_end_date);
              const daysUntilExpiry = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              if (daysUntilExpiry > 0 && daysUntilExpiry <= 90) {
                return (
                  <Badge variant="outline" className={
                    daysUntilExpiry <= 7 ? "bg-red-50 text-red-700 border-red-200" :
                    daysUntilExpiry <= 30 ? "bg-orange-50 text-orange-700 border-orange-200" :
                    "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }>
                    ⚠️ Expires in {daysUntilExpiry} days
                  </Badge>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}

      {/* 🔧 State Metadata (can remove after testing) */}
      {event.state_version && (
        <div className="text-xs text-gray-500 italic">
          State v{event.state_version} • Source: {event.change_source || 'manual'}
        </div>
      )}
    </div>
  );
}

// 🎯 NEW: ContractMilestoneCard Component
interface ContractMilestoneCardProps {
  event: TimelineEvent;
  isFirst?: boolean;
}

function ContractMilestoneCard({ event, isFirst }: ContractMilestoneCardProps) {
  if (!event.contract_milestone_type) return null;

  const getMilestoneConfig = (type: string) => {
    switch (type) {
      case 'contract_started':
        return {
          icon: FileText,
          title: 'Contract Started',
          bgClass: 'bg-blue-50 border-blue-200',
          iconClass: 'text-blue-600',
          titleClass: 'text-blue-700 font-semibold'
        };
      case 'contract_ending_soon':
        return {
          icon: Clock,
          title: 'Contract Ending Soon',
          bgClass: 'bg-orange-50 border-orange-200',
          iconClass: 'text-orange-600',
          titleClass: 'text-orange-700 font-semibold'
        };
      case 'contract_ended':
        return {
          icon: FileText,
          title: 'Contract Ended',
          bgClass: 'bg-red-50 border-red-200',
          iconClass: 'text-red-600',
          titleClass: 'text-red-700 font-semibold'
        };
      case 'contract_converted':
        return {
          icon: TrendingUp,
          title: 'Contract Converted',
          bgClass: 'bg-green-50 border-green-200',
          iconClass: 'text-green-600',
          titleClass: 'text-green-700 font-semibold'
        };
      default:
        return {
          icon: FileText,
          title: 'Contract Event',
          bgClass: 'bg-gray-50 border-gray-200',
          iconClass: 'text-gray-600',
          titleClass: 'text-gray-700 font-semibold'
        };
    }
  };

  const config = getMilestoneConfig(event.contract_milestone_type);
  const Icon = config.icon;
  const milestoneData = event.contract_milestone_data;

  return (
    <div className={`p-4 rounded-lg border-2 ${config.bgClass} mb-3`}>
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`h-5 w-5 ${config.iconClass}`} />
        <h4 className={config.titleClass}>
          {config.title}
        </h4>
        {isFirst && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Latest
          </Badge>
        )}
      </div>

      {/* Contract Details */}
      {milestoneData && (
        <div className="space-y-2">
          {milestoneData.contract_type && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                📄 {milestoneData.contract_type === 'fixed' ? 'Fixed-term' : 'Permanent'}
              </Badge>
              {milestoneData.start_date && milestoneData.end_date && (
                <Badge variant="outline" className="bg-white">
                  📅 {format(new Date(milestoneData.start_date), 'MMM d, yyyy')} → {format(new Date(milestoneData.end_date), 'MMM d, yyyy')}
                </Badge>
              )}
            </div>
          )}

          {milestoneData.previous_contract_type && milestoneData.contract_type && (
            <div className="text-sm text-gray-600">
              Converted from <strong>{milestoneData.previous_contract_type}</strong> to <strong>{milestoneData.contract_type}</strong>
            </div>
          )}

          {milestoneData.duration_months && (
            <div className="text-sm text-gray-600">
              Duration: {milestoneData.duration_months} months
            </div>
          )}
        </div>
      )}

      {/* Expiry Warning */}
      {event.expiry_warning_level !== 'none' && event.days_until_expiry && (
        <div className={`mt-3 p-2 rounded border ${
          event.expiry_warning_level === 'critical' ? 'bg-red-100 border-red-300 text-red-700' :
          event.expiry_warning_level === 'urgent' ? 'bg-orange-100 border-orange-300 text-orange-700' :
          'bg-yellow-100 border-yellow-300 text-yellow-700'
        }`}>
          ⚠️ Contract expires in {event.days_until_expiry} days
        </div>
      )}
    </div>
  );
}

export interface TimelineEvent {
  id: string;
  event_type: string;
  event_date: string;
  event_description: string;

  // Legacy fields (still supported)
  salary_at_event: number | null;
  hours_at_event: number | null;
  change_amount: number | null;
  change_percentage: number | null;
  is_milestone: boolean;
  milestone_type: string | null;
  change_reason: string | null;
  previous_value: any;
  new_value: any;

  // Complete State Fields (NEW!)
  month_wage_at_event: number | null;
  hours_per_week_at_event: number | null;
  annual_salary_at_event: number | null;
  net_monthly_at_event: number | null;

  // Context Fields
  role_at_event: string | null;
  department_at_event: string | null;
  contract_type_at_event: string | null;
  employment_type_at_event: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;

  // Metadata
  state_version: number | null;
  fields_changed: string[] | null;
  change_source: string | null;

  // Contract Milestone Fields (NEW!)
  contract_milestone_type: 'contract_started' | 'contract_ending_soon' | 'contract_ended' | 'contract_converted' | null;
  contract_milestone_data: {
    contract_type?: 'fixed' | 'permanent';
    start_date?: string;
    end_date?: string;
    duration_months?: number;
    previous_contract_type?: 'fixed' | 'permanent';
    warning_days?: number;
  } | null;
  days_until_expiry: number | null;
  expiry_warning_level: 'none' | 'upcoming' | 'urgent' | 'critical';

  // Manual Event Fields (NEW!)
  is_manual?: boolean;
  manual_notes?: string;
  contract_pdf_path?: string;
  created_by?: string;
}

interface EmployeeTimelineProps {
  employeeId: string;
  employeeName?: string;
  onEventClick?: (event: TimelineEvent) => void;
  onAddComment?: () => void;
  onAddChange?: () => void;
}

export function EmployeeTimeline({ 
  employeeId,
  employeeName,
  onEventClick,
  onAddComment,
  onAddChange
}: EmployeeTimelineProps) {
  // State for manual timeline event dialog
  const [isManualEventDialogOpen, setIsManualEventDialogOpen] = useState(false);
  const { data: events, isLoading } = useQuery({
    queryKey: ['employee-timeline-complete', employeeId],
    queryFn: async () => {
      // console.log('🚀 [CompleteState] Fetching COMPLETE timeline state for:', employeeId);

      const { data, error } = await supabase
        .from('employes_timeline_v2')
        .select(`
          *,
          month_wage_at_event,
          hours_per_week_at_event,
          annual_salary_at_event,
          net_monthly_at_event,
          role_at_event,
          department_at_event,
          contract_type_at_event,
          employment_type_at_event,
          contract_start_date,
          contract_end_date,
          state_version,
          fields_changed,
          change_source,
          contract_milestone_type,
          contract_milestone_data,
          days_until_expiry,
          expiry_warning_level,
          is_manual,
          manual_notes,
          contract_pdf_path,
          created_by
        `)
        .eq('employee_id', employeeId)
        .order('event_date', { ascending: false });
      
      if (error) {
        console.error('❌ [EmployeeTimeline] Error:', error);
        throw error;
      }
      
      // console.log('🎊 [CompleteState] Events loaded:', data?.length);

      // 🎯 COMPLETE STATE INSPECTION: Show our beautiful new data
      if (data && data.length > 0) {
        const firstEvent = data[0];
        // console.log('🎯 [CompleteState] First event complete state:', {
        //   event_type: firstEvent.event_type,
        //   // Complete salary data
        //   month_wage_at_event: firstEvent.month_wage_at_event,
        //   annual_salary_at_event: firstEvent.annual_salary_at_event,
        //   net_monthly_at_event: firstEvent.net_monthly_at_event,
        //   // Complete hours data
        //   hours_per_week_at_event: firstEvent.hours_per_week_at_event,
        //   // Context data
        //   role_at_event: firstEvent.role_at_event,
        //   department_at_event: firstEvent.department_at_event,
        //   contract_type_at_event: firstEvent.contract_type_at_event,
        //   employment_type_at_event: firstEvent.employment_type_at_event,
        //   // Metadata
        //   state_version: firstEvent.state_version,
        //   change_source: firstEvent.change_source,
        // });
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
            {/* Add Historical Event Button */}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsManualEventDialogOpen(true)}
              className="gap-2 border-pink-300 text-pink-700 hover:bg-pink-50"
            >
              <Plus className="h-4 w-4" />
              <FileText className="h-4 w-4" />
              Add Historical Event
            </Button>
            
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
            {events.map((event, index) => {
              // 🎯 NEW: Render ContractMilestoneCard for contract milestone events
              if (event.contract_milestone_type) {
                return (
                  <div key={event.id} className="relative pl-16">
                    {/* Timeline dot for milestone */}
                    <div className="absolute left-6 top-3 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-4 border-white shadow-lg z-10">
                      <div className="absolute -top-1 -right-1">
                        <Award className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <ContractMilestoneCard event={event} isFirst={index === 0} />
                  </div>
                );
              }

              // Regular timeline event card
              return (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  isFirst={index === 0}
                  onClick={onEventClick}
                />
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* Manual Timeline Event Dialog */}
      <ManualTimelineEventDialog
        employeeId={employeeId}
        employeeName={employeeName}
        open={isManualEventDialogOpen}
        onOpenChange={setIsManualEventDialogOpen}
      />
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
  // 🎯 COMPLETE STATE TIMELINE: Using beautiful backfilled data directly!
  // console.log('🎯 [CompleteState] TimelineEventCard rendering with complete state:', {
  //   event_type: event.event_type,
  //   month_wage_at_event: event.month_wage_at_event,
  //   hours_per_week_at_event: event.hours_per_week_at_event,
  //   state_version: event.state_version,
  //   role_at_event: event.role_at_event,
  //   department_at_event: event.department_at_event,
  // });
  
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

  // Override style for manual events (pink styling)
  const isManual = event.is_manual || event.event_type === 'manual_adjustment';
  const style = isManual ? {
    icon: FileText,
    color: 'text-pink-700',
    bg: 'bg-pink-50',
    border: 'border-pink-300',
    dotBg: 'bg-pink-500',
  } : getEventStyle();
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
                {isManual && (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-300">
                    <FileText className="h-3 w-3 mr-1" />
                    MANUAL
                  </Badge>
                )}
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
              
              {/* 🎯 NEW: CompleteStateGrid - Clean, Direct Database Access! */}
              <CompleteStateGrid event={event} isFirst={isFirst} />
              
              {/* Manual event notes and PDF */}
              {isManual && (event.manual_notes || event.contract_pdf_path) && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-pink-200">
                  {event.manual_notes && (
                    <div className="mb-2">
                      <div className="text-xs font-medium text-pink-700 mb-1">Historical Notes:</div>
                      <p className="text-sm text-gray-700">{event.manual_notes}</p>
                    </div>
                  )}
                  {event.contract_pdf_path && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 border-pink-300 text-pink-700 hover:bg-pink-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open PDF in new tab
                        const { data: { publicUrl } } = supabase.storage
                          .from('contracts')
                          .getPublicUrl(event.contract_pdf_path!);
                        window.open(publicUrl, '_blank');
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      View Contract PDF
                    </Button>
                  )}
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
