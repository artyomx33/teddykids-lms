/**
 * EventSlidePanel Component
 * 
 * Smart slide panel that shows different views based on timeline event type:
 * - Contract Started/Renewed → Full contract view
 * - Salary/Hours changes → Addendum view
 * - Comments → Comment view
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { TimelineEvent } from "@/components/staff/EmployeeTimeline";
import { ContractAddendumView } from "./ContractAddendumView";
import { ContractFullText } from "./ContractFullText";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Briefcase,
  MessageSquare,
  Download,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface EventSlidePanelProps {
  event: TimelineEvent | null;
  staffId?: string;
  staffName?: string;
  onClose: () => void;
}

export function EventSlidePanel({ 
  event, 
  staffId, 
  staffName, 
  onClose 
}: EventSlidePanelProps) {
  if (!event) return null;

  const isOpen = !!event;

  // Determine what view to show
  // Contract events: contract_change, contract_start, contract_renewal, etc.
  const shouldShowFullContract = event.event_type.toLowerCase().includes('contract');
  const shouldShowAddendum = ['salary_increase', 'salary_decrease', 'hours_change', 'location_change'].includes(event.event_type);

  // Get icon for event type
  const getEventIcon = () => {
    switch (event.event_type) {
      case 'contract_change':
        return <FileText className="h-5 w-5" />;
      case 'salary_increase':
      case 'salary_decrease':
        return <TrendingUp className="h-5 w-5" />;
      case 'hours_change':
        return <Clock className="h-5 w-5" />;
      case 'location_change':
        return <MapPin className="h-5 w-5" />;
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            {getEventIcon()}
            <div>
              <div>
                {event.event_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                {format(new Date(event.event_date), 'MMMM d, yyyy')}
              </div>
            </div>
            {event.is_milestone && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Milestone
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {shouldShowFullContract && (
            <>
              {/* Action buttons for contract */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Contract Document</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
              
              <ContractFullText 
                contract={{
                  employee_name: staffName,
                  query_params: {
                    startDate: event.event_date,
                    hoursPerWeek: event.hours_per_week_at_event || event.hours_at_event || 0,
                    grossMonthly: event.month_wage_at_event || event.salary_at_event || 0,
                    contractType: event.event_description.includes('Fixed-term') 
                      ? 'Bepaalde tijd' 
                      : event.event_description.includes('Permanent')
                      ? 'Onbepaalde tijd'
                      : 'Bepaalde tijd',
                    endDate: event.event_description.match(/until (\d{1,2}\/\d{1,2}\/\d{4})/)?.[1],
                  }
                }}
              />
            </>
          )}

          {shouldShowAddendum && (
            <ContractAddendumView 
              event={event} 
              staffName={staffName || 'Employee'} 
            />
          )}

          {!shouldShowFullContract && !shouldShowAddendum && (
            <div className="rounded-lg border p-6 bg-gray-50">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Event Details</h3>
                  <p className="text-sm text-gray-700">{event.event_description}</p>
                  
                  {event.change_reason && (
                    <div className="mt-3 p-3 bg-white rounded-lg border">
                      <div className="text-xs font-medium text-gray-600 mb-1">Reason:</div>
                      <p className="text-sm">{event.change_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
