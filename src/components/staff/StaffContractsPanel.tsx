import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Download, Calendar, AlertTriangle, History, Grid3X3 } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { useState } from "react";
import {
  StaffContract,
  UserRole,
  canViewSalaryInfo,
  canCreateContract,
  getContractStatusColor,
  formatCurrency,
} from "@/lib/staff-contracts";
import { ContractHistoryTimeline } from "./ContractHistoryTimeline";

// Type-safe view mode constants
const VIEW_MODES = {
  GRID: 'grid',
  TIMELINE: 'timeline'
} as const;

type ViewMode = 'grid' | 'timeline';

interface StaffContractsPanelProps {
  staffId: string;
  staffName: string;
  contracts: StaffContract[];
  currentUserRole: UserRole;
  isUserManager: boolean;
  onRefresh?: () => void;
}

export function StaffContractsPanel({
  staffId,
  staffName,
  contracts,
  currentUserRole,
  isUserManager,
  onRefresh,
}: StaffContractsPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const canSeeFinancials = canViewSalaryInfo(currentUserRole, false, isUserManager);
  const canCreate = canCreateContract(currentUserRole, isUserManager);
  
  const activeContracts = contracts.filter(c => c.status === 'active');
  const upcomingContracts = contracts.filter(c => 
    c.start_date && isAfter(new Date(c.start_date), new Date())
  );
  const expiringContracts = contracts.filter(c => 
    c.end_date && 
    c.status === 'active' &&
    isBefore(new Date(c.end_date), addDays(new Date(), 60))
  );

  // Show timeline view if selected
  if (viewMode === 'timeline') {
    return (
      <div className="space-y-4">
        {/* Header with view toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Contracts</CardTitle>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex bg-muted rounded-lg p-1">
                   <Button
                     size="sm"
                     variant={(viewMode as string) === 'grid' ? 'default' : 'ghost'}
                     onClick={() => setViewMode('grid')}
                     className="h-8 px-3"
                   >
                     <Grid3X3 className="h-4 w-4 mr-1" />
                     Overview
                   </Button>
                   <Button
                     size="sm"
                     variant={(viewMode as string) === 'timeline' ? 'default' : 'ghost'}
                     onClick={() => setViewMode('timeline')}
                     className="h-8 px-3"
                   >
                    <History className="h-4 w-4 mr-1" />
                    Timeline
                  </Button>
                </div>

                {canCreate && (
                  <Button size="sm" asChild>
                    <Link to={`/generate-contract?staff=${encodeURIComponent(staffName)}`}>
                      <Plus className="h-4 w-4 mr-1" />
                      New Contract
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Timeline Component */}
        <ContractHistoryTimeline
          contracts={contracts}
          staffName={staffName}
          canSeeFinancials={canSeeFinancials}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Contracts</CardTitle>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
               <Button
                 size="sm"
                 variant={(viewMode as string) === 'grid' ? 'default' : 'ghost'}
                 onClick={() => setViewMode('grid')}
                 className="h-8 px-3"
               >
                 <Grid3X3 className="h-4 w-4 mr-1" />
                 Overview
               </Button>
               <Button
                 size="sm"
                 variant={(viewMode as string) === 'timeline' ? 'default' : 'ghost'}
                 onClick={() => setViewMode('timeline')}
                 className="h-8 px-3"
               >
                <History className="h-4 w-4 mr-1" />
                Timeline
              </Button>
            </div>

            {canCreate && (
              <Button size="sm" asChild>
                <Link to={`/generate-contract?staff=${encodeURIComponent(staffName)}`}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Contract
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert for expiring contracts */}
        {expiringContracts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">
                  {expiringContracts.length} contract{expiringContracts.length > 1 ? 's' : ''} expiring soon
                </p>
                <p className="text-orange-700">
                  Consider creating extension contracts
                </p>
              </div>
            </div>
          </div>
        )}

        {contracts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No contracts found</p>
            {canCreate && (
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link to={`/generate-contract?staff=${encodeURIComponent(staffName)}`}>
                  Create First Contract
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                canSeeFinancials={canSeeFinancials}
              />
            ))}
          </div>
        )}

        {/* Contract Summary Stats */}
        {contracts.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs">
            <div className="text-center">
              <div className="font-medium">{activeContracts.length}</div>
              <div className="text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{upcomingContracts.length}</div>
              <div className="text-muted-foreground">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{contracts.length}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ContractCardProps {
  contract: StaffContract;
  canSeeFinancials: boolean;
}

function ContractCard({ contract, canSeeFinancials }: ContractCardProps) {
  const statusColor = getContractStatusColor(contract.status, contract.days_until_end);
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), 'MMM dd, yyyy');
  };

  const getDaysText = (days: number | null, type: 'start' | 'end') => {
    if (days === null || days === undefined) return null;
    
    if (days > 0) {
      return type === 'start' 
        ? `Starts in ${days} days`
        : `Ends in ${days} days`;
    } else if (days === 0) {
      return type === 'start' ? 'Starts today' : 'Ends today';
    } else {
      return type === 'start' 
        ? `Started ${Math.abs(days)} days ago`
        : `Ended ${Math.abs(days)} days ago`;
    }
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusColor}>
              {contract.status}
            </Badge>
            {contract.contract_type && (
              <span className="text-xs text-muted-foreground">
                {contract.contract_type}
              </span>
            )}
          </div>
          
          {contract.position && (
            <p className="text-sm font-medium">{contract.position}</p>
          )}
          
          {contract.location && (
            <p className="text-xs text-muted-foreground">{contract.location}</p>
          )}
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/contract/${contract.id}`}>
              <Eye className="h-3 w-3" />
            </Link>
          </Button>
          {contract.pdf_path && (
            <Button variant="ghost" size="sm" asChild>
              <a href={`/contract/${contract.id}/download`} target="_blank">
                <Download className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Contract Duration */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Start:</span>
          <span>{formatDate(contract.start_date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">End:</span>
          <span>{formatDate(contract.end_date)}</span>
        </div>
        
        {/* Days countdown */}
        {contract.days_until_start !== null && contract.days_until_start > 0 && (
          <div className="text-blue-600 font-medium">
            {getDaysText(contract.days_until_start, 'start')}
          </div>
        )}
        {contract.days_until_end !== null && contract.days_until_end > 0 && contract.days_until_end <= 60 && (
          <div className="text-orange-600 font-medium">
            {getDaysText(contract.days_until_end, 'end')}
          </div>
        )}
      </div>

      {/* Financial Information (Admin only) */}
      {canSeeFinancials && contract.salary_info && (
        <div className="border-t pt-2 space-y-1 text-xs">
          {contract.salary_info.scale && contract.salary_info.trede && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scale:</span>
              <span className="font-mono">{contract.salary_info.scale}-{contract.salary_info.trede}</span>
            </div>
          )}
          {contract.salary_info.grossMonthly && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Monthly:</span>
              <span className="font-mono font-medium">
                {formatCurrency(contract.salary_info.grossMonthly)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}