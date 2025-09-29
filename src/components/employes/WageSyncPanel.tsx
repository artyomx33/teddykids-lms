import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface WageSyncPanelProps {
  staffId: string;
  staffName: string;
}

interface SyncResult {
  success: boolean;
  employee_found?: {
    first_name: string;
    surname: string;
    email: string;
    employment: {
      salary: {
        month_wage: number;
        hour_wage: number;
      };
      contract: {
        hours_per_week: number;
      };
    };
  };
  mapping_created?: boolean;
  history_record?: any;
  contract_financial?: any;
  errors?: string[];
}

export function WageSyncPanel({ staffId, staffName }: WageSyncPanelProps) {
  const [syncing, setSyncing] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // Fetch current salary from cao_salary_history
  const { data: currentSalary, refetch: refetchSalary } = useQuery({
    queryKey: ['current-salary', staffId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_salary', {
        p_staff_id: staffId
      });
      
      if (error) throw error;
      return data?.[0];
    }
  });

  const handleSyncWage = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('employes-integration', {
        body: {
          action: 'sync_individual_wage',
          staff_id: staffId
        }
      });

      if (error) throw error;

      setSyncResult(data);
      setResultDialogOpen(true);
      
      // Refetch salary data
      await refetchSalary();

      if (data.success) {
        toast({
          title: "Wage data synced",
          description: `Successfully synced salary data for ${staffName}`,
        });
      }
    } catch (error: any) {
      console.error('Wage sync error:', error);
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync wage data",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Wage Sync
              </CardTitle>
              <CardDescription>
                Sync salary data from Employes.nl
              </CardDescription>
            </div>
            <Button
              onClick={handleSyncWage}
              disabled={syncing}
              size="sm"
              className="gap-2"
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentSalary ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly Gross</span>
                <span className="font-medium">€{currentSalary.gross_monthly?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hourly Rate</span>
                <span className="font-medium">€{currentSalary.hourly_wage?.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hours/Week</span>
                <span className="font-medium">{currentSalary.hours_per_week}h</span>
              </div>
              {currentSalary.scale && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">CAO Scale</span>
                  <Badge variant="secondary">
                    {currentSalary.scale} - Trede {currentSalary.trede}
                  </Badge>
                </div>
              )}
              {currentSalary.effective_date && (
                <div className="text-xs text-muted-foreground mt-2">
                  Effective from: {new Date(currentSalary.effective_date).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No salary data available</p>
              <p className="text-xs mt-1">Click "Sync Now" to fetch from Employes.nl</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Results Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {syncResult?.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Wage Sync Successful
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Wage Sync Failed
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Detailed results of the wage synchronization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {syncResult?.employee_found && (
              <div className="space-y-3">
                <h3 className="font-semibold">Employee Found in Employes</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">
                      {syncResult.employee_found.first_name} {syncResult.employee_found.surname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{syncResult.employee_found.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Salary:</span>
                    <span className="font-medium">
                      €{syncResult.employee_found.employment?.salary?.month_wage?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hourly Wage:</span>
                    <span className="font-medium">
                      €{syncResult.employee_found.employment?.salary?.hour_wage?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours/Week:</span>
                    <span className="font-medium">
                      {syncResult.employee_found.employment?.contract?.hours_per_week}h
                    </span>
                  </div>
                </div>
              </div>
            )}

            {syncResult?.mapping_created && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Created employee mapping in database</span>
              </div>
            )}

            {syncResult?.history_record && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Created salary history record</span>
              </div>
            )}

            {syncResult?.contract_financial && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Updated contract financials (encrypted)</span>
              </div>
            )}

            {syncResult?.errors && syncResult.errors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-destructive">Errors</h3>
                <div className="bg-destructive/10 p-4 rounded-lg space-y-1">
                  {syncResult.errors.map((error, idx) => (
                    <div key={idx} className="text-sm text-destructive flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setResultDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
