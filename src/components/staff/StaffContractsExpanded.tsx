import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Eye, 
  Download, 
  Calendar, 
  AlertTriangle, 
  MapPin,
  Building2,
  Clock,
  Euro,
  User,
  Phone,
  Mail,
  FileText,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, isAfter, isBefore, addDays } from "date-fns";
import {
  StaffContract,
  UserRole,
  canViewSalaryInfo,
  canCreateContract,
  getContractStatusColor,
  formatCurrency,
} from "@/lib/staff-contracts";

interface StaffContractsExpandedProps {
  staffId: string;
  staffName: string;
  contracts: StaffContract[];
  currentUserRole: UserRole;
  isUserManager: boolean;
  onRefresh?: () => void;
}

export function StaffContractsExpanded({
  staffId,
  staffName,
  contracts,
  currentUserRole,
  isUserManager,
  onRefresh,
}: StaffContractsExpandedProps) {
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), 'MMM dd, yyyy');
  };

  const getEmploymentDuration = (contract: StaffContract) => {
    if (!contract.start_date) return null;
    
    const startDate = new Date(contract.start_date);
    const endDate = contract.end_date ? new Date(contract.end_date) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months`;
    }
    return `${Math.floor(diffDays / 365)} years`;
  };

  return (
    <div className="space-y-6">
      {/* Contract Overview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Employment History</CardTitle>
            <div className="flex items-center gap-2">
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
        <CardContent>
          {/* Summary Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{activeContracts.length}</div>
              <div className="text-xs text-blue-700">Active</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{upcomingContracts.length}</div>
              <div className="text-xs text-green-700">Upcoming</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{expiringContracts.length}</div>
              <div className="text-xs text-orange-700">Expiring</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{contracts.length}</div>
              <div className="text-xs text-gray-700">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert for expiring contracts */}
      {expiringContracts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">
                {expiringContracts.length} contract{expiringContracts.length > 1 ? 's' : ''} expiring soon
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Consider creating extension contracts or planning renewals
              </p>
            </div>
          </div>
        </div>
      )}

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-lg font-medium">No contracts found</p>
            <p className="text-muted-foreground mb-4">
              This employee doesn't have any contract records yet
            </p>
            {canCreate && (
              <Button variant="outline" asChild>
                <Link to={`/generate-contract?staff=${encodeURIComponent(staffName)}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Contract
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Enhanced Contract Cards */
        <div className="space-y-4">
          {contracts.map((contract) => (
            <ExpandedContractCard
              key={contract.id}
              contract={contract}
              canSeeFinancials={canSeeFinancials}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExpandedContractCardProps {
  contract: StaffContract;
  canSeeFinancials: boolean;
}

function ExpandedContractCard({ contract, canSeeFinancials }: ExpandedContractCardProps) {
  const statusColor = getContractStatusColor(contract.status, contract.days_until_end);
  const queryParams = contract.query_params || {};
  
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={statusColor}>
                {contract.status}
              </Badge>
              {contract.contract_type && (
                <Badge variant="secondary">
                  {contract.contract_type}
                </Badge>
              )}
            </div>
            
            {contract.position && (
              <h3 className="text-lg font-semibold">{contract.position}</h3>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {contract.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {contract.location}
                </div>
              )}
              {queryParams.department && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {queryParams.department}
                </div>
              )}
            </div>
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
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contract Duration & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{formatDate(contract.start_date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">End Date:</span>
              <span className="font-medium">{formatDate(contract.end_date)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {queryParams.hoursPerWeek && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hours/Week:</span>
                <span className="font-medium">{queryParams.hoursPerWeek}h</span>
              </div>
            )}
            {queryParams.employmentStatus && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">{queryParams.employmentStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Days countdown */}
        {(contract.days_until_start !== null && contract.days_until_start > 0) && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              {getDaysText(contract.days_until_start, 'start')}
            </div>
          </div>
        )}
        
        {(contract.days_until_end !== null && contract.days_until_end > 0 && contract.days_until_end <= 60) && (
          <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-sm font-medium text-orange-800">
              {getDaysText(contract.days_until_end, 'end')}
            </div>
          </div>
        )}

        {/* Enhanced Employment Information */}
        {(queryParams.employeesId || queryParams.employeeNumber || queryParams.locationId) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Employment Details</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {queryParams.employeeNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employee #:</span>
                    <span className="font-mono">{queryParams.employeeNumber}</span>
                  </div>
                )}
                {queryParams.employeesId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employes ID:</span>
                    <span className="font-mono text-xs">{queryParams.employeesId.slice(0, 8)}...</span>
                  </div>
                )}
                {queryParams.locationId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location ID:</span>
                    <span className="font-mono text-xs">{queryParams.locationId.slice(0, 8)}...</span>
                  </div>
                )}
                {queryParams.departmentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dept ID:</span>
                    <span className="font-mono text-xs">{queryParams.departmentId.slice(0, 8)}...</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Financial Information (Admin/Manager only) */}
        {canSeeFinancials && contract.salary_info && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Euro className="h-3 w-3" />
                Financial Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {contract.salary_info.scale && contract.salary_info.trede && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scale:</span>
                    <span className="font-mono font-medium">{contract.salary_info.scale}-{contract.salary_info.trede}</span>
                  </div>
                )}
                {contract.salary_info.grossMonthly && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Monthly:</span>
                    <span className="font-mono font-medium text-green-700">
                      {formatCurrency(contract.salary_info.grossMonthly)}
                    </span>
                  </div>
                )}
                {queryParams.hourlyRate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hourly Rate:</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(queryParams.hourlyRate)}/hr
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Contract Actions */}
        <Separator />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Created {format(new Date(contract.created_at), 'MMM dd, yyyy')}
            {contract.signed_at && (
              <>
                <span>•</span>
                Signed {format(new Date(contract.signed_at), 'MMM dd, yyyy')}
              </>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/contract/${contract.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                View Full
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}