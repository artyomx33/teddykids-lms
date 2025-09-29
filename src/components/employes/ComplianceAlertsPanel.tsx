import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  AlertCircle, 
  Info,
  ExternalLink 
} from 'lucide-react';
import { generateComplianceAlerts, ComplianceAlert } from '@/lib/employesContracts';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function ComplianceAlertsPanel() {
  const navigate = useNavigate();
  
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['compliance-alerts'],
    queryFn: generateComplianceAlerts,
    refetchInterval: 60000, // Refresh every minute
  });

  const getSeverityIcon = (severity: ComplianceAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: ComplianceAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive bg-destructive/5';
      case 'warning':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
          <CardDescription>Loading alerts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-500" />
            Compliance Alerts
          </CardTitle>
          <CardDescription>All contracts are compliant</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-500 bg-green-50">
            <AlertDescription className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="font-semibold text-green-700">
                No compliance issues detected
              </span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Compliance Alerts
            </CardTitle>
            <CardDescription>
              {criticalAlerts.length} critical • {warningAlerts.length} warnings • {infoAlerts.length} info
            </CardDescription>
          </div>
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {criticalAlerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <Alert 
            key={alert.id} 
            className={getSeverityColor(alert.severity)}
          >
            <div className="flex items-start gap-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1 space-y-2">
                <div>
                  <div className="font-semibold text-sm">
                    {alert.employeeName}
                  </div>
                  <div className="text-sm mt-1">
                    {alert.message}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {alert.actionRequired}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {alert.type && (
                    <Badge variant="outline" className="text-xs">
                      {alert.type.replace('_', ' ')}
                    </Badge>
                  )}
                  
                  {alert.deadline && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Deadline: {format(new Date(alert.deadline), 'MMM d, yyyy')}
                    </Badge>
                  )}
                  
                  {alert.daysRemaining !== null && (
                    <Badge 
                      variant={alert.daysRemaining < 0 ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {alert.daysRemaining < 0 
                        ? `${Math.abs(alert.daysRemaining)} days overdue`
                        : `${alert.daysRemaining} days remaining`
                      }
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => navigate(`/staff?id=${alert.employeeId}`)}
                  >
                    View Staff
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
