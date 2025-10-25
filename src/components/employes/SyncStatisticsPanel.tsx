/**
 * 📊 SYNC STATISTICS PANEL
 * High-level metrics and statistics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SyncStatistics {
  totalEmployees: number;
  totalChanges: number;
  errorsCount: number;
  successRate: number;
}

export function SyncStatisticsPanel() {
  const [stats, setStats] = useState<SyncStatistics>({
    totalEmployees: 0,
    totalChanges: 0,
    errorsCount: 0,
    successRate: 100,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);

      // Get total unique employees
      const { data: employees } = await supabase
        .from('employes_raw_data')
        .select('employee_id')
        .eq('is_latest', true)
        .eq('endpoint', '/employee');

      const uniqueEmployees = new Set(employees?.map(e => e.employee_id) || []);
      const totalEmployees = uniqueEmployees.size;

      // Get total changes (all time)
      const { count: totalChanges } = await supabase
        .from('employes_changes')
        .select('*', { count: 'exact', head: true })
        .eq('is_duplicate', false);  // 🎯 FILTER OUT DUPLICATES

      // Get error count from sync logs
      const { count: errorsCount } = await supabase
        .from('employes_sync_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'error');

      // Calculate success rate - handle if table doesn't exist
      const { count: totalSyncs, error: totalError } = await supabase
        .from('employes_sync_sessions')
        .select('*', { count: 'exact', head: true });

      const { count: successfulSyncs, error: successError } = await supabase
        .from('employes_sync_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // If table doesn't exist, default to 100% success rate
      if (totalError || successError) {
        console.warn('⚠️ employes_sync_sessions table not found, using defaults');
      }

      const successRate = totalSyncs && totalSyncs > 0 
        ? Math.round((successfulSyncs || 0) / totalSyncs * 100) 
        : 100;

      setStats({
        totalEmployees,
        totalChanges: totalChanges || 0,
        errorsCount: errorsCount || 0,
        successRate,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    color: string;
  }) => (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Sync Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Loading statistics...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Sync Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Employees"
            value={stats.totalEmployees}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Changes Detected"
            value={stats.totalChanges}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={AlertCircle}
            label="Errors"
            value={stats.errorsCount}
            color={stats.errorsCount > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}
          />
          <StatCard
            icon={CheckCircle}
            label="Success Rate"
            value={`${stats.successRate}%`}
            color="bg-green-100 text-green-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}
