import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEmployesIntegration } from '@/hooks/useEmployesIntegration';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AutoSyncButton = () => {
  const { autoSyncAll, isLoading } = useEmployesIntegration();
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);

  const handleAutoSync = async () => {
    try {
      toast.info('Starting comprehensive auto-sync...', {
        description: 'This will collect data, sync to staff table, and check compliance'
      });

      const result = await autoSyncAll();
      
      setLastSyncResult(result);

      if (result.auto_sync_results) {
        toast.success('Auto-sync completed!', {
          description: `Created: ${result.auto_sync_results.success}, Failed: ${result.auto_sync_results.failed}`
        });
      } else {
        toast.success('Data collection completed!', {
          description: `Processed ${result.employees_processed}/${result.total_employees} employees`
        });
      }

      // Show compliance alerts if any
      if (result.compliance_alerts?.alerts?.length > 0) {
        const criticalAlerts = result.compliance_alerts.alerts.filter(
          (a: any) => a.severity === 'critical'
        ).length;
        
        if (criticalAlerts > 0) {
          toast.warning('Compliance alerts detected', {
            description: `${criticalAlerts} critical issue(s) require attention`
          });
        }
      }
    } catch (error: any) {
      console.error('Auto-sync error:', error);
      toast.error('Auto-sync failed', {
        description: error.message || 'An unknown error occurred'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Automated Sync System
        </CardTitle>
        <CardDescription>
          Collect data from Employes.nl, sync to staff table, and check compliance - all in one click
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleAutoSync}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Auto-Sync...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Full Auto-Sync
            </>
          )}
        </Button>

        {lastSyncResult && (
          <div className="space-y-3">
            <Alert className="bg-success/10 border-success">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                <div className="font-semibold">Last Sync Results:</div>
                <div className="text-xs mt-1 space-y-1">
                  <div>• Employees processed: {lastSyncResult.employees_processed}/{lastSyncResult.total_employees}</div>
                  <div>• Endpoints collected: {lastSyncResult.endpoints_collected?.length || 0}</div>
                  {lastSyncResult.auto_sync_results && (
                    <>
                      <div>• Staff created: {lastSyncResult.auto_sync_results.success}</div>
                      <div>• Staff updated: {lastSyncResult.auto_sync_results.updated || 0}</div>
                      <div>• Errors: {lastSyncResult.errors?.length || 0}</div>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {lastSyncResult.compliance_alerts?.alerts?.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">Compliance Alerts:</div>
                  <div className="text-xs mt-1 space-y-1">
                    {lastSyncResult.compliance_alerts.alerts.map((alert: any, idx: number) => (
                      <div key={idx}>• {alert.message}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div>ℹ️ This process will:</div>
          <div>1. Collect comprehensive data from all Employes.nl endpoints</div>
          <div>2. Automatically sync to your staff table</div>
          <div>3. Run compliance checks for contracts, documents, and reviews</div>
          <div>4. Detect and log any changes or conflicts</div>
        </div>
      </CardContent>
    </Card>
  );
};