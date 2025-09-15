import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { fetchStaffList, StaffListItem } from "@/lib/staff";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewChips, StarBadge } from "@/components/staff/ReviewChips";
import { StaffActionCards } from "@/components/staff/StaffActionCards";
import { StaffFilterBar, StaffFilters } from "@/components/staff/StaffFilterBar";
import { MapPin, GraduationCap } from "lucide-react";

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
  const [filters, setFilters] = useState<StaffFilters>({
    internsOnly: false,
    internYear: null,
    manager: null,
    location: null,
    missingDocs: false,
    contractStatus: null,
  });

  // Enhanced staff data with manager and location from enriched contracts
  const { data: enrichedStaff = [] } = useQuery({
    queryKey: ["staff-enriched-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts_enriched")
        .select("staff_id, manager_key, location_key, position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const enrichedStaffMap = useMemo(() => {
    const map = new Map();
    enrichedStaff.forEach(item => {
      if (item.staff_id) {
        map.set(item.staff_id, {
          manager: item.manager_key,
          location: item.location_key,
          position: item.position
        });
      }
    });
    return map;
  }, [enrichedStaff]);

  // Get staff with intern status
  const { data: staffDetails = [] } = useQuery({
    queryKey: ["staff-intern-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("id, is_intern, intern_year");
      if (error) throw error;
      return data ?? [];
    },
  });

  const staffDetailsMap = useMemo(() => {
    const map = new Map();
    staffDetails.forEach(staff => {
      map.set(staff.id, {
        is_intern: staff.is_intern,
        intern_year: staff.intern_year
      });
    });
    return map;
  }, [staffDetails]);

  const filtered = useMemo(() => {
    let result = data;

    // Apply search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.role || "").toLowerCase().includes(q) ||
          (s.location || "").toLowerCase().includes(q)
      );
    }

    // Apply filters
    if (filters.internsOnly) {
      result = result.filter(s => staffDetailsMap.get(s.id)?.is_intern);
    }

    if (filters.internYear) {
      result = result.filter(s => 
        staffDetailsMap.get(s.id)?.intern_year === parseInt(filters.internYear!)
      );
    }

    if (filters.manager) {
      result = result.filter(s => {
        const enriched = enrichedStaffMap.get(s.id);
        return enriched?.manager === filters.manager;
      });
    }

    if (filters.location) {
      result = result.filter(s => {
        const enriched = enrichedStaffMap.get(s.id);
        return enriched?.location === filters.location;
      });
    }

    if (filters.contractStatus) {
      if (filters.contractStatus === 'active') {
        result = result.filter(s => s.active);
      } else if (filters.contractStatus === 'ended') {
        result = result.filter(s => !s.active);
      }
    }

    return result;
  }, [data, query, filters, enrichedStaffMap, staffDetailsMap]);

  const getManagerDisplayName = (managerKey: string | null) => {
    const managers: Record<string, string> = {
      'mike': 'Mike Chen',
      'lisa': 'Lisa Wang', 
      'david': 'David Kim',
      'anna': 'Anna Brown'
    };
    return managerKey ? managers[managerKey] || managerKey : '—';
  };

  const getLocationDisplayName = (locationKey: string | null) => {
    const locations: Record<string, string> = {
      'rbw': 'Rainbow',
      'zml': 'Zuiderpark ML',
      'office': 'Office',
      'home': 'Home'
    };
    return locationKey ? locations[locationKey] || locationKey : '—';
  };

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

      {/* Action Cards */}
      <StaffActionCards />

      {/* Filter Bar */}
      <StaffFilterBar filters={filters} onFiltersChange={setFilters} />

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
                    <th className="py-2 pr-4">Manager</th>
                    <th className="py-2 pr-4">Location</th>
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{s.name}</span>
                          <StarBadge show={flagsByStaffId.get(s.id)?.has_five_star_badge} />
                          {staffDetailsMap.get(s.id)?.is_intern && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              Y{staffDetailsMap.get(s.id)?.intern_year || '?'}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="text-sm">
                          {getManagerDisplayName(enrichedStaffMap.get(s.id)?.manager)}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {getLocationDisplayName(enrichedStaffMap.get(s.id)?.location)}
                          </span>
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
