import { useQuery } from '@tanstack/react-query';
import { generateComplianceAlerts } from '@/lib/employesContracts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  TrendingUp,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ComplianceDashboard() {
  const navigate = useNavigate();
  
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['compliance-alerts'],
    queryFn: generateComplianceAlerts,
    refetchInterval: 60000, // Refresh every minute
  });

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  const chainRuleAlerts = alerts.filter(a => a.type === 'chain_rule' || a.type === 'permanent_required');
  const terminationAlerts = alerts.filter(a => a.type === 'termination_notice');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-info" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const getComplianceScore = () => {
    if (alerts.length === 0) return 100;
    const weight = { critical: 10, warning: 5, info: 1 };
    const totalWeight = alerts.reduce((sum, a) => sum + weight[a.severity], 0);
    const maxWeight = alerts.length * 10;
    return Math.max(0, Math.round(100 - (totalWeight / maxWeight) * 100));
  };

  const complianceScore = getComplianceScore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h1>
        <p className="text-muted-foreground">
          Dutch Labor Law compliance monitoring and alerts
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <Progress value={complianceScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {complianceScore >= 90 ? 'Excellent' : complianceScore >= 70 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Action needed soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Total compliance items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalAlerts.length} critical issue{criticalAlerts.length > 1 ? 's' : ''}</strong> require immediate attention to avoid legal penalties
          </AlertDescription>
        </Alert>
      )}

      {/* Compliance Alerts by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({criticalAlerts.length})</TabsTrigger>
          <TabsTrigger value="chain">Chain Rule ({chainRuleAlerts.length})</TabsTrigger>
          <TabsTrigger value="termination">Termination ({terminationAlerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground text-center">
                  No compliance issues detected. All contracts are in compliance with Dutch labor law.
                </p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className={alert.severity === 'critical' ? 'border-destructive' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <CardTitle className="text-base">{alert.employeeName}</CardTitle>
                        <CardDescription className="mt-1">{alert.message}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Action Required:</span>
                      <span className="text-muted-foreground">{alert.actionRequired}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Type:</span>
                      <Badge variant="outline">
                        {alert.type === 'permanent_required' ? 'Permanent Required' :
                         alert.type === 'chain_rule' ? 'Chain Rule' :
                         alert.type === 'termination_notice' ? 'Termination Notice' : alert.type}
                      </Badge>
                    </div>
                    {alert.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Deadline:</span>
                        <span className="text-muted-foreground">
                          {new Date(alert.deadline).toLocaleDateString('nl-NL')}
                        </span>
                        {alert.daysRemaining !== null && (
                          <Badge variant={alert.daysRemaining <= 0 ? 'destructive' : 'secondary'}>
                            <Clock className="h-3 w-3 mr-1" />
                            {alert.daysRemaining <= 0 ? 'OVERDUE' : `${alert.daysRemaining} days`}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/staff/${alert.employeeId}`)}
                    >
                      View Employee
                    </Button>
                    {alert.type === 'permanent_required' && (
                      <Button variant="outline" size="sm">
                        Generate Permanent Contract
                      </Button>
                    )}
                    {alert.type === 'termination_notice' && (
                      <Button variant="outline" size="sm">
                        Send Notice
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {criticalAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                <p className="text-muted-foreground">No critical issues</p>
              </CardContent>
            </Card>
          ) : (
            criticalAlerts.map((alert) => (
              <Card key={alert.id} className="border-destructive">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <CardTitle className="text-base">{alert.employeeName}</CardTitle>
                        <CardDescription className="mt-1">{alert.message}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="destructive">CRITICAL</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Action Required:</span>
                      <span className="text-muted-foreground">{alert.actionRequired}</span>
                    </div>
                    {alert.deadline && alert.daysRemaining !== null && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Deadline:</span>
                        <span className="text-muted-foreground">
                          {new Date(alert.deadline).toLocaleDateString('nl-NL')}
                        </span>
                        <Badge variant={alert.daysRemaining <= 0 ? 'destructive' : 'secondary'}>
                          {alert.daysRemaining <= 0 ? 'OVERDUE' : `${alert.daysRemaining} days`}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/staff/${alert.employeeId}`)}
                    >
                      View Employee
                    </Button>
                    <Button variant="outline" size="sm">
                      Take Action
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="chain" className="space-y-4">
          {chainRuleAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                <p className="text-muted-foreground">All contracts comply with Chain Rule</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dutch Chain Contract Rule (Ketenregeling)</CardTitle>
                  <CardDescription>
                    Maximum 3 temporary contracts in 3 years. After that, a permanent contract is required.
                  </CardDescription>
                </CardHeader>
              </Card>
              {chainRuleAlerts.map((alert) => (
                <Card key={alert.id} className={alert.severity === 'critical' ? 'border-destructive' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <CardTitle className="text-base">{alert.employeeName}</CardTitle>
                          <CardDescription className="mt-1">{alert.message}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Required Action:</span>
                        <span className="text-muted-foreground">{alert.actionRequired}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/staff/${alert.employeeId}`)}
                      >
                        View Contract History
                      </Button>
                      {alert.type === 'permanent_required' && (
                        <Button variant="outline" size="sm">
                          Generate Permanent Contract
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="termination" className="space-y-4">
          {terminationAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                <p className="text-muted-foreground">No upcoming termination deadlines</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Termination Notices</CardTitle>
                  <CardDescription>
                    Dutch law requires employers to notify employees 1 month before contract end. Late notification incurs penalties.
                  </CardDescription>
                </CardHeader>
              </Card>
              {terminationAlerts.map((alert) => (
                <Card key={alert.id} className={alert.severity === 'critical' ? 'border-destructive' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <CardTitle className="text-base">{alert.employeeName}</CardTitle>
                          <CardDescription className="mt-1">{alert.message}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Action:</span>
                        <span className="text-muted-foreground">{alert.actionRequired}</span>
                      </div>
                      {alert.contractEndDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Contract End:</span>
                          <span className="text-muted-foreground">
                            {new Date(alert.contractEndDate).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/staff/${alert.employeeId}`)}
                      >
                        View Employee
                      </Button>
                      <Button variant="outline" size="sm">
                        Send Termination Notice
                      </Button>
                      <Button variant="outline" size="sm">
                        Extend Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
