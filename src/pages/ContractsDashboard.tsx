import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarDays,
  FileText,
  PartyPopper,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart,
  ArrowUpRight,
  Cake,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchExpiringContracts,
  fetchUpcomingBirthdays,
  fetchKpiStats,
  daysUntil,
  countdownBadgeVariant,
  formatDate,
  formatBirthday,
} from "@/lib/contractsDashboard";

function VariantBadge({ days }: { days: number | null }) {
  const variant = countdownBadgeVariant(days);
  const cls =
    variant === "green"
      ? "bg-green-100 text-green-800"
      : variant === "orange"
      ? "bg-yellow-100 text-yellow-800"
      : variant === "red"
      ? "bg-red-100 text-red-800"
      : "bg-muted text-muted-foreground";
  return <Badge className={cls}>{days === null ? "—" : `${days} days`}</Badge>;
}

export default function ContractsDashboard() {
  // Fetch expiring contracts (next 90 days)
  const { data: expiring = [], isLoading: expiringLoading } = useQuery({
    queryKey: ["expiringContracts"],
    queryFn: () => fetchExpiringContracts(90),
  });

  // Fetch upcoming birthdays (next 14 days)
  const { data: birthdays = [], isLoading: birthdaysLoading } = useQuery({
    queryKey: ["upcomingBirthdays"],
    queryFn: () => fetchUpcomingBirthdays(14),
  });

  // Fetch KPI statistics
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["kpiStats"],
    queryFn: () => fetchKpiStats(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contracts Overview</h1>
          <p className="text-muted-foreground mt-1">
            Proactive alerts and at-a-glance insights
          </p>
        </div>
        <Button asChild>
          <Link to="/contracts">
            <FileText className="w-4 h-4 mr-2" />
            View All Contracts
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Contracts This Year */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Contracts (YTD)
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpisLoading ? "—" : kpis?.createdThisYear ?? "0"}
            </div>
          </CardContent>
        </Card>

        {/* Ended Contracts This Year */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ended Contracts (YTD)
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpisLoading ? "—" : kpis?.endedThisYear ?? "0"}
            </div>
          </CardContent>
        </Card>

        {/* Net Change */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Change (YTD)
            </CardTitle>
            <BarChart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              !kpis?.net ? "text-foreground" :
              kpis.net > 0 ? "text-success" : 
              kpis.net < 0 ? "text-destructive" : "text-foreground"
            }`}>
              {kpisLoading ? "—" : (kpis?.net ?? 0) > 0 ? `+${kpis?.net}` : kpis?.net ?? "0"}
            </div>
          </CardContent>
        </Card>

        {/* Top Manager (Signed) */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Manager (Signed)
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground capitalize">
              {kpisLoading ? "—" : kpis?.topSigned ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Contracts */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> 
            Upcoming Contract Expirations
          </CardTitle>
          <CardDescription>
            Contracts ending in the next 90 days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {expiringLoading ? (
            <div className="text-sm text-muted-foreground py-4">
              Loading expiring contracts...
            </div>
          ) : expiring.length === 0 ? (
            <div className="text-sm py-4 flex items-center gap-2">
              <PartyPopper className="w-4 h-4 text-primary" />
              <span>🎉 All current contracts are stable!</span>
            </div>
          ) : (
            expiring.map((contract) => {
              const daysRemaining = daysUntil(contract.end_date);
              return (
                <div
                  key={contract.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex flex-col">
                    <div className="font-medium">{contract.employee_name}</div>
                    <div className="text-sm text-muted-foreground flex gap-2">
                      <span>Ends: {formatDate(contract.end_date)}</span>
                      <span>•</span>
                      <span>Manager: {contract.manager || "—"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <VariantBadge days={daysRemaining} />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm">
                            Extend
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Coming soon</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Replace
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Coming soon</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
        {expiring.length > 0 && (
          <CardFooter className="flex justify-end border-t border-border pt-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/contracts">
                View all contracts
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Upcoming Birthdays */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="w-5 h-5" /> 
            Upcoming Birthdays
          </CardTitle>
          <CardDescription>
            Staff birthdays in the next 14 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {birthdaysLoading ? (
            <div className="text-sm text-muted-foreground py-2">
              Loading birthdays...
            </div>
          ) : birthdays.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No upcoming birthdays in the next 14 days.
            </div>
          ) : (
            <div className="space-y-2">
              {birthdays.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="font-medium">{person.employee_name}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <PartyPopper className="w-3 h-3" />
                      {formatBirthday(person.birth_date)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
