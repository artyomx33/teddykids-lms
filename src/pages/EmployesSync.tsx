import React, { useState, useCallback } from 'react';
import { EmployesSyncDashboard } from '@/components/employes/EmployesSyncDashboard';
import { EmployesDataFetcher } from '@/components/employes/EmployesDataFetcher';
import { ComplianceAlertsPanel } from '@/components/employes/ComplianceAlertsPanel';
import { UnifiedDataTester } from '@/components/employes/UnifiedDataTester';
import { UnifiedSyncPanel } from '@/components/employes/UnifiedSyncPanel';

export default function EmployesSync() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [employeeData, setEmployeeData] = useState<any[]>([]);

  // Unified refresh function that coordinates all components
  const handleGlobalRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Handle employee data from fetcher
  const handleEmployeeDataUpdate = useCallback((data: any[]) => {
    setEmployeeData(data);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employes Integration</h1>
        <p className="text-muted-foreground">
          Sync employee data between LMS and Employes.nl payroll system with Dutch labor law compliance
        </p>
      </div>
      
      {/* Dutch Labor Law Compliance Alerts */}
      <ComplianceAlertsPanel />

      {/* THE UNIFIED SYNC MAGIC */}
      <UnifiedSyncPanel />

      {/* 🧪 UNIFIED DATA SERVICE TESTER */}
      <UnifiedDataTester />

      {/* Employee Data Fetcher */}
      <EmployesDataFetcher
        refreshTrigger={refreshTrigger}
        onEmployeeDataUpdate={handleEmployeeDataUpdate}
      />

      <EmployesSyncDashboard
        refreshTrigger={refreshTrigger}
        onGlobalRefresh={handleGlobalRefresh}
        sharedEmployeeData={employeeData}
      />
    </div>
  );
}