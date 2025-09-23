import React from 'react';
import { EmployesSyncDashboard } from '@/components/employes/EmployesSyncDashboard';

export default function EmployesSync() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employes Integration</h1>
        <p className="text-muted-foreground">
          Sync employee data between LMS and Employes.nl payroll system
        </p>
      </div>
      
      <EmployesSyncDashboard />
    </div>
  );
}