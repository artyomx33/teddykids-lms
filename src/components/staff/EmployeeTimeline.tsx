import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, TrendingUp, TrendingDown } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  employee_id: string;
  event_type: "salary_increase" | "salary_decrease" | "contract_change" | "hours_change" | string;
  event_date: string;
  event_description: string | null;
  is_milestone: boolean | null;
  change_amount: number | null;
  change_percentage: number | null;
}

interface EmployeeTimelineProps {
  employeeId: string;
  onEventClick?: (event: TimelineEvent) => void;
}

const timelineFields = [
  "id",
  "employee_id",
  "event_type",
  "event_date",
  "event_description",
  "is_milestone",
  "change_amount",
  "change_percentage"
].join(",");

export function EmployeeTimeline({ employeeId, onEventClick }: EmployeeTimelineProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["employee-timeline", employeeId],
    enabled: Boolean(employeeId),
    queryFn: async () => {
      const { data: rows, error: queryError } = await supabase
        .from("employes_timeline_v2")
        .select(timelineFields)
        .eq("employee_id", employeeId)
        .order("event_date", { ascending: false });

      if (queryError) throw queryError;
      return rows as TimelineEvent[];
    }
  });

  const summary = useMemo(() => {
    if (!data || data.length === 0) return null;

    const salaryChanges = data.filter((event) => event.event_type === "salary_increase" && event.change_amount);
    const totalGrowth = salaryChanges.reduce((sum, event) => sum + (event.change_amount || 0), 0);

    return {
      totalEvents: data.length,
      milestones: data.filter((event) => event.is_milestone).length,
      salaryIncreases: salaryChanges.length,
      totalGrowth
    };
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employment timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">Loading timeline…</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employment timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-destructive">Unable to load timeline data.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employment timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">No timeline events yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Employment timeline
          </CardTitle>
          {summary && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{summary.totalEvents} events</span>
              <span>{summary.milestones} milestones</span>
              <span>{summary.salaryIncreases} salary changes</span>
              <span>€{summary.totalGrowth.toFixed(0)} growth</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {data.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onEventClick?.(event)}
                className={cn(
                  "w-full rounded-lg border bg-card text-left transition hover:bg-muted",
                  onEventClick ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div className="flex items-start gap-4 p-4">
                  <EventIcon type={event.event_type} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{event.event_type.replace(/_/g, " ")}</p>
                      {event.is_milestone && <Badge>Milestone</Badge>}
                    </div>
                    {event.event_description && (
                      <p className="mt-1 text-sm text-muted-foreground">{event.event_description}</p>
                    )}
                    {(event.change_amount || event.change_percentage) && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {event.change_amount ? `${event.change_amount > 0 ? "+" : "-"}€${Math.abs(event.change_amount)}` : null}
                        {event.change_amount && event.change_percentage ? " • " : null}
                        {event.change_percentage ? `${event.change_percentage > 0 ? "+" : "-"}${Math.abs(event.change_percentage)}%` : null}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{format(new Date(event.event_date), "MMM d, yyyy")}</p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function EventIcon({ type }: { type: TimelineEvent["event_type"] }) {
  switch (type) {
    case "salary_increase":
      return <TrendingUp className="h-5 w-5 text-emerald-600" />;
    case "salary_decrease":
      return <TrendingDown className="h-5 w-5 text-red-600" />;
    case "hours_change":
      return <Clock className="h-5 w-5 text-blue-600" />;
    default:
      return <Calendar className="h-5 w-5 text-muted-foreground" />;
  }
}

