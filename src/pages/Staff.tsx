import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { fetchStaffList, StaffListItem } from "@/lib/staff";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewChips, StarBadge } from "@/components/staff/ReviewChips";

export default function StaffPage() {
  const { data = [], isLoading } = useQuery<StaffListItem[]>({
    queryKey: ["staffList"],
    queryFn: fetchStaffList,
  });

  // Enriched flags (star badge + review needs)
  const { data: enriched = [] } = useQuery({
    queryKey: ["contracts_enriched_flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts_enriched")
        .select(
          "staff_id, has_five_star_badge, needs_six_month_review, needs_yearly_review"
        );
      if (error) throw error;
      return data ?? [];
    },
  });

  const flagsByStaffId = useMemo(() => {
    const m = new Map<
      string,
      {
        has_five_star_badge?: boolean | null;
        needs_six_month_review?: boolean | null;
        needs_yearly_review?: boolean | null;
      }
    >();
    for (const r of enriched as any[]) {
      if (r.staff_id) m.set(r.staff_id, r);
    }
    return m;
  }, [enriched]);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.role || "").toLowerCase().includes(q) ||
        (s.location || "").toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Overview</h1>
          <p className="text-muted-foreground">
            Track milestones, reviews & certificates
          </p>
        </div>
        <Input
          placeholder="Search by name / role / location"
          className="w-80"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>All Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No staff found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">First Contract</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Review</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="py-2 pr-4">
                        <div className="flex items-center">
                          <span className="font-medium">{s.name}</span>
                          <StarBadge show={flagsByStaffId.get(s.id)?.has_five_star_badge} />
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        {s.firstContractDate ?? "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={s.active ? "default" : "secondary"}>
                          {s.active ? "Active" : "Ended"}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">
                        {flagsByStaffId.has(s.id) ? (
                          <ReviewChips
                            needsSix={flagsByStaffId.get(s.id)?.needs_six_month_review}
                            needsYearly={flagsByStaffId.get(s.id)?.needs_yearly_review}
                          />
                        ) : (
                          <Badge variant={s.hasRecentReview ? "default" : "outline"}>
                            {s.hasRecentReview ? "Up to date" : "Overdue"}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <Link
                          to={`/staff/${s.id}`}
                          className="text-primary hover:underline"
                        >
                          View Profile →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
