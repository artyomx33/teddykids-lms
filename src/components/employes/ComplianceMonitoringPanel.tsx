import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Clock, AlertTriangle, CheckCircle, FileX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ComplianceAlert {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  message: string;
  details: any[];
}

export const ComplianceMonitoringPanel = () => {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  useEffect(() => {
    loadComplianceData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadComplianceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const alertsData: ComplianceAlert[] = [];

      // Check 1: Expiring contracts
      const { data: expiringContracts, error: contractError } = await supabase
        .from('contracts_expiring_soon')
        .select('*');

      if (!contractError && expiringContracts && expiringContracts.length > 0) {
        const critical = expiringContracts.filter(c => c.urgency_level === 'critical');
        alertsData.push({
          type: 'contract_expiration',
          severity: critical.length > 0 ? 'critical' : 'warning',
          count: expiringContracts.length,
          message: `${expiringContracts.length} contract(s) expiring soon`,
          details: expiringContracts
        });
      }

      // Check 2: Missing documents
      const { data: missingDocs } = await supabase
        .from('staff_docs_status')
        .select('*')
        .gt('missing_count', 0)
        .order('missing_count', { ascending: false });

      if (missingDocs && missingDocs.length > 0) {
        alertsData.push({
          type: 'missing_documents',
          severity: 'warning',
          count: missingDocs.length,
          message: `${missingDocs.length} staff with missing documents`,
          details: missingDocs.slice(0, 10)
        });
      }

      // Check 3: Reviews needed
      const { data: reviewsNeeded } = await supabase
        .from('staff_reviews_needed')
        .select('*');

      if (reviewsNeeded && reviewsNeeded.length > 0) {
        alertsData.push({
          type: 'overdue_reviews',
          severity: 'info',
          count: reviewsNeeded.length,
          message: `${reviewsNeeded.length} staff need reviews`,
          details: reviewsNeeded.slice(0, 10)
        });
      }

      // Check 4: Unresolved sync conflicts
      const { data: conflicts } = await supabase
        .from('unresolved_sync_conflicts')
        .select('*');

      if (conflicts && conflicts.length > 0) {
        alertsData.push({
          type: 'sync_conflicts',
          severity: 'warning',
          count: conflicts.length,
          message: `${conflicts.length} sync conflict(s) need resolution`,
          details: conflicts
        });
      }

      setAlerts(alertsData);
      setLastCheck(new Date().toISOString());
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Clock className="h-5 w-5 text-info" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-warning text-warning">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract_expiration':
        return <Clock className="h-4 w-4" />;
      case 'missing_documents':
        return <FileX className="h-4 w-4" />;
      case 'overdue_reviews':
        return <AlertCircle className="h-4 w-4" />;
      case 'sync_conflicts':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Real-Time Compliance Monitoring
        </CardTitle>
        <CardDescription>
          Automated compliance checks and alerts
          {lastCheck && (
            <span className="text-xs ml-2">
              Last checked: {new Date(lastCheck).toLocaleTimeString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <Alert className="bg-success/10 border-success">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              All compliance checks passed! No issues detected.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <Alert key={index} className="relative">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(alert.type)}
                      <span className="font-semibold">{alert.message}</span>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <AlertDescription className="text-sm">
                      {alert.type === 'contract_expiration' && (
                        <div className="mt-2 space-y-1">
                          {alert.details.slice(0, 3).map((contract: any) => (
                            <div key={contract.id} className="text-xs">
                              • {contract.full_name} - expires in {contract.days_until_expiry} days
                            </div>
                          ))}
                          {alert.details.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              + {alert.details.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                      {alert.type === 'missing_documents' && (
                        <div className="mt-2 space-y-1">
                          {alert.details.slice(0, 3).map((staff: any) => (
                            <div key={staff.staff_id} className="text-xs">
                              • {staff.full_name} - {staff.missing_count} document(s) missing
                            </div>
                          ))}
                          {alert.details.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              + {alert.details.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                      {alert.type === 'overdue_reviews' && (
                        <div className="mt-2 space-y-1">
                          {alert.details.slice(0, 3).map((staff: any) => (
                            <div key={staff.id} className="text-xs">
                              • {staff.full_name} - {staff.review_type.replace('_', ' ')}
                            </div>
                          ))}
                          {alert.details.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              + {alert.details.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                      {alert.type === 'sync_conflicts' && (
                        <div className="mt-2 space-y-1">
                          {alert.details.slice(0, 3).map((conflict: any) => (
                            <div key={conflict.id} className="text-xs">
                              • {conflict.full_name || 'Unknown'} - {conflict.conflict_type}
                            </div>
                          ))}
                          {alert.details.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              + {alert.details.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};