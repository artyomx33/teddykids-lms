import React from 'react';
import { UnifiedSyncPanel } from '@/components/employes/UnifiedSyncPanel';
import { ComplianceAlertsPanel } from '@/components/employes/ComplianceAlertsPanel';

export default function EmployesSync() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Unified Employes Sync</h1>
        <p className="text-muted-foreground">
          🚀 One click to sync everything: employees + wages + contracts + compliance
        </p>
      </div>

      {/* Dutch Labor Law Compliance Alerts */}
      <ComplianceAlertsPanel />

      {/* THE UNIFIED SYNC MAGIC */}
      <UnifiedSyncPanel />
    </div>
  );
}