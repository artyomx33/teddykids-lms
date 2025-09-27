import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, TrendingUp, MapPin, Briefcase, Clock, Euro } from "lucide-react";
import { format, isValid, parseISO, differenceInDays } from "date-fns";
import { StaffContract, formatCurrency } from "@/lib/staff-contracts";

interface ContractHistoryTimelineProps {
  contracts: StaffContract[];
  staffName: string;
  canSeeFinancials: boolean;
}

interface ContractChange {
  date: string;
  type: 'salary' | 'position' | 'contract' | 'location' | 'hours';
  title: string;
  description: string;
  amount?: number;
  badge?: string;
  contract: StaffContract;
}

export function ContractHistoryTimeline({
  contracts,
  staffName,
  canSeeFinancials
}: ContractHistoryTimelineProps) {
  // Sort contracts by start date
  const sortedContracts = [...contracts].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date) : new Date(a.created_at);
    const dateB = b.start_date ? new Date(b.start_date) : new Date(b.created_at);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Generate timeline changes
  const changes: ContractChange[] = [];

  sortedContracts.forEach((contract, index) => {
    const nextContract = sortedContracts[index + 1];
    const contractDate = contract.start_date || contract.created_at;

    // Add contract start
    changes.push({
      date: contractDate,
      type: 'contract',
      title: 'Contract - Bepaalde tijd',
      description: `Van ${formatDate(contract.start_date)} t/m ${formatDate(contract.end_date)}`,
      badge: contract.status,
      contract
    });

    // Add salary info if available and permitted
    if (canSeeFinancials && contract.salary_info?.grossMonthly) {
      const prevSalary = nextContract?.salary_info?.grossMonthly;
      const isIncrease = prevSalary && contract.salary_info.grossMonthly > prevSalary;

      changes.push({
        date: contractDate,
        type: 'salary',
        title: 'Salaris gewijzigd',
        description: `${formatCurrency(contract.salary_info.grossMonthly)} per maand`,
        amount: contract.salary_info.grossMonthly,
        badge: isIncrease ? 'verhoging' : undefined,
        contract
      });
    }

    // Add position changes
    if (contract.position && contract.position !== nextContract?.position) {
      changes.push({
        date: contractDate,
        type: 'position',
        title: 'Functie gewijzigd',
        description: contract.position,
        contract
      });
    }

    // Add location changes
    if (contract.location && contract.location !== nextContract?.location) {
      changes.push({
        date: contractDate,
        type: 'location',
        title: 'Locatie gewijzigd',
        description: getLocationName(contract.location),
        contract
      });
    }
  });

  // Group changes by date and sort chronologically (most recent first)
  const groupedChanges = changes.reduce((acc, change) => {
    const date = change.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(change);
    return acc;
  }, {} as Record<string, ContractChange[]>);

  const sortedDates = Object.keys(groupedChanges).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—';
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, 'dd MMM yyyy') : '—';
    } catch {
      return '—';
    }
  };

  const getLocationName = (code: string | null): string => {
    const locations: Record<string, string> = {
      'rbw': 'Rijnsburgerweg 35',
      'zml': 'Zeemanlaan 22a',
      'lrz': 'Lorentzkade 15a',
      'rb3&5': 'Rijnsburgerweg 3&5'
    };
    return code ? (locations[code] || code) : 'Onbekend';
  };

  const getChangeIcon = (type: ContractChange['type']) => {
    switch (type) {
      case 'salary': return <Euro className="h-4 w-4" />;
      case 'position': return <Briefcase className="h-4 w-4" />;
      case 'contract': return <CalendarDays className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'hours': return <Clock className="h-4 w-4" />;
      default: return <CalendarDays className="h-4 w-4" />;
    }
  };

  const getChangeColor = (type: ContractChange['type']) => {
    switch (type) {
      case 'salary': return 'text-green-600 bg-green-50';
      case 'position': return 'text-blue-600 bg-blue-50';
      case 'contract': return 'text-purple-600 bg-purple-50';
      case 'location': return 'text-orange-600 bg-orange-50';
      case 'hours': return 'text-cyan-600 bg-cyan-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Contract Geschiedenis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            Geen contractgeschiedenis beschikbaar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Contract Geschiedenis
          <Badge variant="secondary" className="ml-2">
            {contracts.length} contract{contracts.length !== 1 ? 'en' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract Statistics */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Actieve contracten</div>
            <div className="text-lg font-semibold">
              {contracts.filter(c => c.status === 'active').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Totale periode</div>
            <div className="text-lg font-semibold">
              {(() => {
                const oldest = sortedContracts[sortedContracts.length - 1];
                const newest = sortedContracts[0];
                const oldestDate = oldest?.start_date || oldest?.created_at;
                const newestDate = newest?.end_date || newest?.start_date || newest?.created_at;

                if (oldestDate && newestDate) {
                  const days = differenceInDays(new Date(newestDate), new Date(oldestDate));
                  const years = Math.floor(days / 365);
                  const months = Math.floor((days % 365) / 30);

                  if (years > 0) {
                    return `${years}j ${months}m`;
                  } else {
                    return `${months}m`;
                  }
                }
                return '—';
              })()}
            </div>
          </div>
        </div>

        <Separator />

        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Wijzigingen</h4>

          {sortedDates.map((date, dateIndex) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {formatDate(date)}
              </div>

              {/* Changes for this date */}
              <div className="space-y-2 ml-6">
                {groupedChanges[date].map((change, changeIndex) => (
                  <div
                    key={changeIndex}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-full ${getChangeColor(change.type)}`}>
                      {getChangeIcon(change.type)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{change.title}</span>
                        {change.badge && (
                          <Badge variant="outline" className="text-xs">
                            {change.badge}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {change.description}
                      </p>

                      {/* Contract details */}
                      {change.type === 'contract' && (
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {change.contract.position && (
                            <div>Functie: {change.contract.position}</div>
                          )}
                          {change.contract.location && (
                            <div>Locatie: {getLocationName(change.contract.location)}</div>
                          )}
                          {canSeeFinancials && change.contract.salary_info?.scale && (
                            <div>
                              Schaal: {change.contract.salary_info.scale}
                              {change.contract.salary_info.trede && `-${change.contract.salary_info.trede}`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Amount display for salary changes */}
                    {change.type === 'salary' && change.amount && canSeeFinancials && (
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {formatCurrency(change.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">per maand</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add separator between dates (except last) */}
              {dateIndex < sortedDates.length - 1 && (
                <Separator className="ml-6" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}