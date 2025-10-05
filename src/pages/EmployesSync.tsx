/**
 * 🔄 EMPLOYES SYNC PAGE
 * Clean, simple, powerful sync interface for the temporal architecture
 */

import { EmployesSyncControl } from '@/components/employes/EmployesSyncControl';
import { RecentChangesPanel } from '@/components/employes/RecentChangesPanel';
import { SyncStatisticsPanel } from '@/components/employes/SyncStatisticsPanel';

export default function EmployesSync() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">📊 Employes.nl Data Sync</h1>
        <p className="text-muted-foreground">
          Keep your employee data fresh and accurate with automatic synchronization
        </p>
      </div>

      {/* Main Sync Control */}
      <EmployesSyncControl />

      {/* Recent Changes */}
      <RecentChangesPanel />

      {/* Statistics */}
      <SyncStatisticsPanel />
    </div>
  );
}