/**
 * 🔄 EMPLOYEES SYNC CONTROL
 * The ONE button that does everything!
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SyncStatus {
  lastSyncAt: string | null;
  status: 'current' | 'outdated' | 'syncing' | 'never' | 'error';
  employeesCount: number;
  recentChangesCount: number;
  currentSessionId?: string;
}

export function EmployesSyncControl() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncAt: null,
    status: 'never',
    employeesCount: 0,
    recentChangesCount: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Load sync status on mount
  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      // Get last sync session - handle if table doesn't exist
      const { data: lastSession, error: sessionError } = await supabase
        .from('employes_sync_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully
      
      // If table doesn't exist or has errors, log it but continue
      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('⚠️ Error fetching sync sessions:', sessionError);
      }

      // Get employee count
      const { count: employeesCount } = await supabase
        .from('employes_raw_data')
        .select('employee_id', { count: 'exact', head: true })
        .eq('is_latest', true)
        .eq('endpoint', '/employee');

      // Get recent changes (last 24 hours)
      const { count: recentChangesCount } = await supabase
        .from('employes_changes')
        .select('*', { count: 'exact', head: true })
        .eq('is_duplicate', false)  // 🎯 FILTER OUT DUPLICATES
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Determine status
      let status: SyncStatus['status'] = 'never';
      if (lastSession) {
        if (lastSession.status === 'running') {
          status = 'syncing';
        } else if (lastSession.status === 'error') {
          status = 'error';
        } else {
          // Check if sync is outdated (>6 hours)
          const hoursSinceSync = (Date.now() - new Date(lastSession.completed_at || lastSession.started_at).getTime()) / (1000 * 60 * 60);
          status = hoursSinceSync > 6 ? 'outdated' : 'current';
        }
      }

      setSyncStatus({
        lastSyncAt: lastSession?.completed_at || lastSession?.started_at || null,
        status,
        employeesCount: employeesCount || 0,
        recentChangesCount: recentChangesCount || 0,
        currentSessionId: lastSession?.status === 'running' ? lastSession.id : undefined,
      });

      // If syncing, set the flag
      if (status === 'syncing') {
        setIsSyncing(true);
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));

    try {
      toast({
        title: "🔄 Sync Started",
        description: "Collecting employee data from Employes.nl...",
      });

      // Get current user for tracking
      const { data: { user } } = await supabase.auth.getUser();

      // Call the HYBRID sync function (instant feedback + background processing!)
      const { data, error } = await supabase.functions.invoke('employes-simple-sync-hybrid', {
        body: { 
          source: 'manual',
          mode: 'interactive', // User is waiting - process first 5 immediately!
          triggered_by: user?.email || 'unknown'
        }
      });

      // Log the full response for debugging
      console.log('🔍 Sync response:', { data, error });

      if (error) {
        console.error('❌ Sync error details:', error);
        throw new Error(`Sync failed: ${error.message || JSON.stringify(error)}`);
      }

      if (!data) {
        throw new Error('Sync failed: No data returned from sync function');
      }

      // If the function returned an error in the data
      if (data.error) {
        console.error('❌ Function error:', data.error);
        console.error('❌ Function error details:', data.errorDetails);
        throw new Error(`Sync failed: ${data.error}`);
      }

      // Check if sync had errors
      const result = data?.result || {};
      const hybrid = data?.hybrid_processing || {};
      
      if (result.errors && result.errors.length > 0) {
        toast({
          title: "⚠️ Sync Completed with Warnings",
          description: `${result.total_employees || 0} employees synced, but ${result.errors.length} error(s) occurred.`,
          variant: "default",
        });
      } else {
        // Success with processing info!
        const hybridMsg = hybrid.immediate > 0 
          ? `✨ All ${hybrid.immediate} employees processed! Timeline populated with ${result.history_processed || 0} employments.`
          : hybrid.queued > 0
          ? `📋 ${hybrid.queued} employees queued for processing`
          : `${result.employees_processed || 0} new, ${result.employees_skipped || 0} unchanged`;
          
        toast({
          title: "✅ Sync Completed",
          description: `Successfully synced ${result.total_employees || 0} employees. ${hybridMsg}`,
        });
      }

      // Reload status
      await loadSyncStatus();
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast({
        title: "❌ Sync Failed",
        description: error.message || "An error occurred during sync",
        variant: "destructive",
      });
      setSyncStatus(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = () => {
    switch (syncStatus.status) {
      case 'current':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> All data current</Badge>;
      case 'outdated':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Outdated</Badge>;
      case 'syncing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Syncing...</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Error</Badge>;
      case 'never':
        return <Badge variant="outline">Never synced</Badge>;
    }
  };

  const getLastSyncText = () => {
    if (!syncStatus.lastSyncAt) return 'Never synced';
    
    const now = Date.now();
    const syncTime = new Date(syncStatus.lastSyncAt).getTime();
    const diffMs = now - syncTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📈 Sync Status</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Last Sync</div>
            <div className="text-lg font-semibold">{getLastSyncText()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Employees</div>
            <div className="text-lg font-semibold">{syncStatus.employeesCount} synced</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground">Recent Changes (24h)</div>
            <div className="text-lg font-semibold">
              {syncStatus.recentChangesCount === 0 ? (
                <span className="text-muted-foreground">No changes</span>
              ) : (
                <span className="text-blue-600">{syncStatus.recentChangesCount} change{syncStatus.recentChangesCount === 1 ? '' : 's'} detected</span>
              )}
            </div>
          </div>
        </div>

        {/* Sync Button */}
        <Button 
          onClick={handleSyncNow} 
          disabled={isSyncing}
          className="w-full"
          size="lg"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center">
          {syncStatus.status === 'never' 
            ? 'Click "Sync Now" to fetch employee data from Employes.nl'
            : syncStatus.status === 'outdated'
            ? 'Data is outdated. Sync recommended.'
            : syncStatus.status === 'current'
            ? 'All data is up to date. Sync again to check for changes.'
            : syncStatus.status === 'syncing'
            ? 'Sync in progress. This may take 1-2 minutes...'
            : 'Last sync encountered an error. Try syncing again.'}
        </p>
      </CardContent>
    </Card>
  );
}
