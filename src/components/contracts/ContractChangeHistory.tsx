import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, TrendingUp, Briefcase, MapPin, Clock, Euro } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchEmploymentHistory, fetchSalaryHistory } from '@/lib/employmentHistory';
import { Loader2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface ContractChangeHistoryProps {
  contractId: string;
  staffId: string;
}

export function ContractChangeHistory({ contractId, staffId }: ContractChangeHistoryProps) {
  // Fetch employment history
  const { data: employmentHistory = [], isLoading: empLoading } = useQuery({
    queryKey: ['employment-history', staffId],
    queryFn: () => fetchEmploymentHistory(staffId),
    enabled: !!staffId,
  });

  // Fetch salary history
  const { data: salaryHistory = [], isLoading: salLoading } = useQuery({
    queryKey: ['salary-history', staffId],
    queryFn: () => fetchSalaryHistory(staffId),
    enabled: !!staffId,
  });

  const isLoading = empLoading || salLoading;

  // Format date
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—';
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, 'dd MMM yyyy') : '—';
    } catch {
      return '—';
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount) return '';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Combine and sort all changes
  const allChanges = [
    ...salaryHistory.map(s => ({
      date: s.cao_effective_date,
      type: 'salary' as const,
      data: s,
    })),
    ...employmentHistory.map(e => ({
      date: e.effective_date,
      type: 'employment' as const,
      data: e,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Change History
          {allChanges.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {allChanges.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && allChanges.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No change history available
          </p>
        )}

        {!isLoading && allChanges.length > 0 && (
          <div className="space-y-4">
            {allChanges.map((change, index) => (
              <div key={index}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-full ${
                    change.type === 'salary' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {change.type === 'salary' ? (
                      <Euro className="h-4 w-4" />
                    ) : (
                      <Briefcase className="h-4 w-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {change.type === 'salary' ? 'Salary Change' : 'Employment Update'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(change.date)}
                      </span>
                    </div>

                    {/* Salary change details */}
                    {change.type === 'salary' && (
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-green-600">
                          {formatCurrency(change.data.gross_monthly)}/month
                        </p>
                        {change.data.scale && change.data.trede && (
                          <p className="text-xs text-muted-foreground">
                            CAO Schaal {change.data.scale} / Trede {change.data.trede}
                          </p>
                        )}
                        {change.data.hours_per_week && (
                          <p className="text-xs text-muted-foreground">
                            {change.data.hours_per_week} hours/week
                          </p>
                        )}
                        {change.data.data_source && (
                          <Badge variant="outline" className="text-xs">
                            {change.data.data_source === 'employes_sync' ? 'Employes' : 'LMS'}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Employment change details */}
                    {change.type === 'employment' && change.data.new_data && (
                      <div className="space-y-1">
                        {change.data.change_type === 'contract_update' && (
                          <p className="text-sm text-muted-foreground">
                            Contract updated via Employes sync
                          </p>
                        )}
                        {change.data.new_data.employmentStartDate && (
                          <p className="text-xs text-muted-foreground">
                            Started: {formatDate(change.data.new_data.employmentStartDate)}
                          </p>
                        )}
                        {change.data.new_data.employeeType && (
                          <p className="text-xs text-muted-foreground">
                            Type: {change.data.new_data.employeeType}
                          </p>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Employes
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {index < allChanges.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

