/**
 * ContractAddendumView Component
 * 
 * Displays a formal addendum for contract changes
 * (salary increases, hours changes, etc.)
 */

import { TimelineEvent } from "@/components/staff/EmployeeTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Download,
  Printer,
  Euro
} from "lucide-react";
import { format } from "date-fns";

interface ContractAddendumViewProps {
  event: TimelineEvent;
  staffName: string;
}

export function ContractAddendumView({ event, staffName }: ContractAddendumViewProps) {
  // Debug: Log event data
  console.log('📋 ContractAddendumView - Event Data:', {
    event_type: event.event_type,
    salary_at_event: event.salary_at_event,
    change_amount: event.change_amount,
    previous_value: event.previous_value,
    new_value: event.new_value,
  });
  
  // Determine change type and formatting
  const isIncrease = event.change_amount && event.change_amount > 0;
  const changeColor = isIncrease ? 'text-green-600' : 'text-red-600';
  const changeBg = isIncrease ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';

  const getChangeIcon = () => {
    if (event.event_type === 'hours_change') return <Clock className="h-5 w-5" />;
    return isIncrease ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contract Addendum</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button size="sm" variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Formal Addendum Document */}
      <Card className={changeBg}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={changeColor}>
              {getChangeIcon()}
            </div>
            <div>
              <div>Addendum to Employment Contract</div>
              <div className="text-sm font-normal text-muted-foreground">
                {staffName}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formal introduction */}
          <div className="text-sm leading-relaxed space-y-3">
            <p>
              <strong>Date:</strong> {format(new Date(event.event_date), 'MMMM d, yyyy')}
            </p>
            
            <p>
              This addendum modifies the employment contract dated [contract start date] 
              between TeddyKids and {staffName}.
            </p>

            {/* Change Details */}
            <div className="my-4 p-4 bg-white rounded-lg border-2 border-dashed">
              <h4 className="font-semibold mb-3">Change Details:</h4>
              
              {event.event_type === 'salary_increase' || event.event_type === 'salary_decrease' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Previous Salary:</strong> €
                      {(() => {
                        // Try to parse previous_value if it's a string
                        let prevValue = event.previous_value;
                        if (typeof prevValue === 'string') {
                          try {
                            prevValue = JSON.parse(prevValue);
                          } catch (e) {
                            // If it's just a number as a string
                            const num = Number(prevValue);
                            if (!isNaN(num)) return num.toFixed(0);
                          }
                        }
                        
                        // Try to get from previous_value object
                        if (prevValue && typeof prevValue === 'object') {
                          const prevSalary = prevValue.salary || prevValue.monthly_wage || prevValue.monthlyWage;
                          if (prevSalary) return Number(prevSalary).toFixed(0);
                        }
                        
                        // Fallback: calculate from current - change (use new field names first)
                        const currentSalary = event.month_wage_at_event || event.salary_at_event;
                        if (currentSalary && event.change_amount) {
                          return (currentSalary - event.change_amount).toFixed(0);
                        }
                        return '-';
                      })()}/month
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>New Salary:</strong> €
                      {(() => {
                        // Try to parse new_value if it's a string
                        let newVal = event.new_value;
                        if (typeof newVal === 'string') {
                          try {
                            newVal = JSON.parse(newVal);
                          } catch (e) {
                            // If it's just a number as a string
                            const num = Number(newVal);
                            if (!isNaN(num)) return num.toFixed(0);
                          }
                        }
                        
                        // Try to get from new_value object
                        if (newVal && typeof newVal === 'object') {
                          const newSalary = newVal.salary || newVal.monthly_wage || newVal.monthlyWage;
                          if (newSalary) return Number(newSalary).toFixed(0);
                        }
                        
                        // Fallback: use month_wage_at_event or salary_at_event
                        const currentSalary = event.month_wage_at_event || event.salary_at_event;
                        if (currentSalary) return currentSalary.toFixed(0);
                        return '-';
                      })()}/month
                    </span>
                  </div>
                  
                  {event.change_amount && (
                    <div className={`flex items-center gap-2 ${changeColor} font-semibold`}>
                      {getChangeIcon()}
                      <span>
                        Change: {isIncrease ? '+' : ''}€{Math.abs(event.change_amount).toFixed(0)}
                        {event.change_percentage && (
                          <span className="ml-1">
                            ({isIncrease ? '+' : ''}{event.change_percentage.toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ) : event.event_type === 'hours_change' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Hours Change:</strong> {event.event_description}
                    </span>
                  </div>
                  {(event.month_wage_at_event || event.salary_at_event) && (
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Salary:</strong> €{(event.month_wage_at_event || event.salary_at_event || 0).toFixed(0)}/month
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm">{event.event_description}</p>
              )}

              {event.change_reason && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-1"><strong>Reason for Change:</strong></p>
                  <p className="text-sm">{event.change_reason}</p>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-700">
              All other terms and conditions of the original employment contract 
              remain in full effect.
            </p>
          </div>

          {/* Signatures section */}
          <div className="mt-6 pt-4 border-t space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <div className="h-12"></div>
                </div>
                <div className="text-xs text-gray-600">
                  <div className="font-medium">Employee Signature</div>
                  <div>{staffName}</div>
                </div>
              </div>
              <div>
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <div className="h-12"></div>
                </div>
                <div className="text-xs text-gray-600">
                  <div className="font-medium">Employer Signature</div>
                  <div>TeddyKids Management</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Official Document - Approved
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Additional info */}
      <div className="text-xs text-muted-foreground italic">
        📄 This is a digital representation. Download for official records.
      </div>
    </div>
  );
}
