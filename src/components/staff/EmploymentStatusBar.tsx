import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { EmploymentJourney } from "@/lib/employesContracts";

interface EmploymentStatusBarProps {
  journey: EmploymentJourney;
}

export function EmploymentStatusBar({ journey }: EmploymentStatusBarProps) {
  const { chainRuleStatus, terminationNotice, salaryProgression } = journey;
  
  // Check for salary stagnation (>12 months)
  // Get LAST item (most recent salary change)
  const lastSalaryChange = salaryProgression && salaryProgression.length > 0 
    ? salaryProgression[salaryProgression.length - 1] 
    : null;
  const lastChangeDate = lastSalaryChange ? new Date(lastSalaryChange.date) : null;
  const monthsSinceLastRaise = lastChangeDate 
    ? Math.floor((new Date().getTime() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  
  // Show alert if more than 12 months since last raise
  const hasSalaryStagnation = monthsSinceLastRaise > 12;

  const hasAlerts = 
    chainRuleStatus.warningLevel !== 'safe' || 
    (terminationNotice?.shouldNotify && terminationNotice.notificationStatus !== 'ideal') ||
    hasSalaryStagnation;

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Chain Rule Alert */}
      {chainRuleStatus.warningLevel !== 'safe' && (
        <Alert className={`flex-1 min-w-[250px] ${
          chainRuleStatus.warningLevel === 'critical' 
            ? 'border-destructive bg-destructive/10' 
            : 'border-warning bg-warning/10'
        }`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm font-medium">{chainRuleStatus.message}</span>
            <Badge variant="outline" className="ml-2">
              {journey.contracts.length}/3 contracts
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Termination Notice Alert */}
      {terminationNotice?.shouldNotify && terminationNotice.notificationStatus !== 'ideal' && (
        <Alert className={`flex-1 min-w-[250px] ${
          terminationNotice.notificationStatus === 'critical'
            ? 'border-destructive bg-destructive/10'
            : terminationNotice.notificationStatus === 'urgent'
            ? 'border-warning bg-warning/10'
            : 'border-primary bg-primary/10'
        }`}>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm font-medium">Termination Notice Due</span>
            <Badge variant="outline" className="ml-2">
              {terminationNotice.daysUntilDeadline} days
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Salary Stagnation Alert */}
      {hasSalaryStagnation && (
        <Alert className="flex-1 min-w-[250px] border-warning bg-warning/10">
          <TrendingDown className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm font-medium">Salary Review Overdue</span>
            <Badge variant="outline" className="ml-2">
              {monthsSinceLastRaise} months
            </Badge>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
