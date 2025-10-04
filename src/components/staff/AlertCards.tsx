import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { EmployesContractData, EmployesSalaryData } from "@/lib/employesProfile";

interface AlertCardsProps {
  contracts: EmployesContractData[];
  salaryHistory: EmployesSalaryData[];
}

interface AlertCard {
  type: 'termination' | 'salary_review' | 'salary_stagnation';
  title: string;
  message: string;
  severity: 'warning' | 'danger' | 'info';
  days?: number;
  months?: number;
}

// Dutch Labor Law Constants
const DUTCH_LABOR_LAW = {
  TERMINATION_NOTICE_DAYS: 30,
  IDEAL_NOTICE_DAYS: 90,
  REMINDER_NOTICE_DAYS: 60
};

function calculateTerminationNotice(contractEndDate: string | null): {
  daysUntilDeadline: number;
  notificationStatus: 'early' | 'ideal' | 'urgent' | 'critical' | 'overdue';
  shouldAlert: boolean;
} | null {
  if (!contractEndDate) return null; // Permanent contract

  const now = new Date();
  const endDate = new Date(contractEndDate);

  // Calculate deadline (30 days before contract end)
  const deadlineDate = new Date(endDate);
  deadlineDate.setDate(deadlineDate.getDate() - DUTCH_LABOR_LAW.TERMINATION_NOTICE_DAYS);

  const daysUntilDeadline = Math.floor(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  let notificationStatus: 'early' | 'ideal' | 'urgent' | 'critical' | 'overdue' = 'early';
  let shouldAlert = false;

  if (daysUntilDeadline < 0) {
    notificationStatus = 'overdue';
    shouldAlert = true;
  } else if (daysUntilDeadline <= 0) {
    notificationStatus = 'critical';
    shouldAlert = true;
  } else if (daysUntilDeadline <= 30) {
    notificationStatus = 'urgent';
    shouldAlert = true;
  } else if (daysUntilDeadline <= 60) {
    notificationStatus = 'ideal';
    shouldAlert = true;
  }

  return {
    daysUntilDeadline,
    notificationStatus,
    shouldAlert
  };
}

export function AlertCards({ contracts, salaryHistory }: AlertCardsProps) {
  const alerts: AlertCard[] = [];

  // Check for contract termination alerts (CAO compliance)
  if (contracts.length > 0) {
    const activeContract = contracts.find(c => c.isActive) || contracts[0];
    if (activeContract?.endDate) {
      const terminationNotice = calculateTerminationNotice(activeContract.endDate);

      if (terminationNotice?.shouldAlert) {
        const { daysUntilDeadline, notificationStatus } = terminationNotice;

        let title = 'Termination Notice Required';
        let message = '';
        let severity: 'warning' | 'danger' = 'warning';

        switch (notificationStatus) {
          case 'overdue':
            title = 'Termination Notice OVERDUE';
            message = `Notice deadline passed ${Math.abs(daysUntilDeadline)} days ago - immediate action required`;
            severity = 'danger';
            break;
          case 'critical':
            title = 'Termination Notice Due TODAY';
            message = 'CAO termination notice must be given today';
            severity = 'danger';
            break;
          case 'urgent':
            title = 'Termination Notice Due Soon';
            message = `Must give notice within ${daysUntilDeadline} days (CAO requirement)`;
            severity = 'danger';
            break;
          case 'ideal':
            title = 'Termination Notice Recommended';
            message = `Consider giving notice now (${daysUntilDeadline} days until deadline)`;
            severity = 'warning';
            break;
        }

        alerts.push({
          type: 'termination',
          title,
          message,
          severity,
          days: Math.abs(daysUntilDeadline)
        });
      }
    }
  }

  // Check for salary review alerts (only with real data)
  if (salaryHistory.length > 0) {
    const latestSalary = salaryHistory[0];
    const salaryStartDate = new Date(latestSalary.startDate);
    const today = new Date();
    const monthsSinceLastReview = Math.floor((today.getTime() - salaryStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    if (monthsSinceLastReview >= 12) {
      alerts.push({
        type: 'salary_review',
        title: 'Salary Review Overdue',
        message: `No salary review in ${monthsSinceLastReview} months`,
        severity: monthsSinceLastReview >= 18 ? 'danger' : 'warning',
        months: monthsSinceLastReview
      });
    }

    // Check for salary stagnation (no increases)
    if (salaryHistory.length > 1) {
      const currentSalary = salaryHistory[0].hourlyWage;
      const previousSalary = salaryHistory[1].hourlyWage;

      if (currentSalary <= previousSalary && monthsSinceLastReview >= 13) {
        alerts.push({
          type: 'salary_stagnation',
          title: 'Salary Stagnation Detected',
          message: `No salary increase in ${monthsSinceLastReview} months. Consider scheduling a compensation review.`,
          severity: 'warning',
          months: monthsSinceLastReview
        });
      }
    }
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <AlertCard key={index} alert={alert} />
      ))}
    </div>
  );
}

function AlertCard({ alert }: { alert: AlertCard }) {
  const getAlertStyles = (severity: 'warning' | 'danger' | 'info') => {
    switch (severity) {
      case 'danger':
        return {
          card: 'border-red-200 bg-red-50',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          badge: 'bg-red-100 text-red-800 border-red-300'
        };
      case 'warning':
        return {
          card: 'border-yellow-200 bg-yellow-50',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
      case 'info':
        return {
          card: 'border-blue-200 bg-blue-50',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800 border-blue-300'
        };
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'termination':
        return <Clock className="h-5 w-5" />;
      case 'salary_review':
        return <AlertTriangle className="h-5 w-5" />;
      case 'salary_stagnation':
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const styles = getAlertStyles(alert.severity);

  return (
    <Card className={styles.card}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={styles.icon}>
              {getIcon(alert.type)}
            </div>
            <div className="space-y-1">
              <h4 className={`font-medium ${styles.title}`}>
                {alert.title}
              </h4>
              <p className={`text-sm ${styles.message}`}>
                {alert.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {alert.days && (
              <Badge className={styles.badge}>
                {alert.days} days
              </Badge>
            )}
            {alert.months && (
              <Badge className={styles.badge}>
                {alert.months} months
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}