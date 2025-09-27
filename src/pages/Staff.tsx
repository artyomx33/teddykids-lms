import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { fetchStaffList, StaffListItem } from "@/lib/staff";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewChips, StarBadge } from "@/components/staff/ReviewChips";
import { StaffActionCards } from "@/components/staff/StaffActionCards";
import { StaffFilterBar, StaffFilters } from "@/components/staff/StaffFilterBar";
import { BulkLocationAssignment } from "@/components/staff/BulkLocationAssignment";
import { MapPin, GraduationCap } from "lucide-react";

export default function StaffPage() {
  const [query, setQuery] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<StaffFilters>({
    internsOnly: false,
    internYear: null,
    manager: null,
    location: null,
    missingDocs: false,
    contractStatus: null,
  });

  // Optimized: Fetch all data in parallel with 2 queries
  const { data = [], isLoading } = useQuery<StaffListItem[]>({
    queryKey: ["staffList"],
    queryFn: fetchStaffList,
  });

  // Consolidated enriched data query
  const { data: enrichedData, isLoading: isEnrichedLoading } = useQuery({
    queryKey: ["staff-enriched-all"],
    queryFn: async () => {
      // Query 1: All enriched contract data
      const enrichedPromise = supabase
        .from("contracts_enriched")
        .select(`
          staff_id, 
          has_five_star_badge, 
          needs_six_month_review, 
          needs_yearly_review,
          manager_key, 
          location_key, 
          position
        `);

      // Query 2: Staff intern details  
      const staffPromise = supabase
        .from("staff")
        .select("id, is_intern, intern_year");

      const [enrichedResult, staffResult] = await Promise.all([
        enrichedPromise,
        staffPromise,
      ]);

      if (enrichedResult.error) throw enrichedResult.error;
      if (staffResult.error) throw staffResult.error;

      return {
        enriched: enrichedResult.data ?? [],
        staff: staffResult.data ?? [],
      };
    },
  });

  // Create optimized lookup maps
  const { flagsByStaffId, enrichedStaffMap, staffDetailsMap } = useMemo(() => {
    if (!enrichedData) {
      return {
        flagsByStaffId: new Map(),
        enrichedStaffMap: new Map(), 
        staffDetailsMap: new Map(),
      };
    }

    const flags = new Map<string, {
      has_five_star_badge?: boolean | null;
      needs_six_month_review?: boolean | null;
      needs_yearly_review?: boolean | null;
    }>();
    
    const enriched = new Map();
    const staffDetails = new Map();

    // Process enriched contract data
    enrichedData.enriched?.forEach((item: any) => {
      if (item.staff_id) {
        flags.set(item.staff_id, {
          has_five_star_badge: item.has_five_star_badge,
          needs_six_month_review: item.needs_six_month_review,
          needs_yearly_review: item.needs_yearly_review,
        });
        enriched.set(item.staff_id, {
          manager: item.manager_key,
          location: item.location_key,
          position: item.position,
        });
      }
    });

    // Process staff intern details
    enrichedData.staff?.forEach((staff: any) => {
      staffDetails.set(staff.id, {
        is_intern: staff.is_intern,
        intern_year: staff.intern_year,
      });
    });

    return {
      flagsByStaffId: flags,
      enrichedStaffMap: enriched,
      staffDetailsMap: staffDetails,
    };
  }, [enrichedData]);

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
      'rbw': 'Rijnsburgerweg 35',
      'zml': 'Zeemanlaan 22a',
      'lrz': 'Lorentzkade 15a',
      'rb3&5': 'Rijnsburgerweg 3&5'
    };
    return locationKey ? locations[locationKey] || locationKey : '—';
  };

  const handleStaffSelection = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaffIds(prev => [...prev, staffId]);
    } else {
      setSelectedStaffIds(prev => prev.filter(id => id !== staffId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStaffIds(filtered.map(s => s.id));
    } else {
      setSelectedStaffIds([]);
    }
  };

  const selectedStaffNames = filtered
    .filter(s => selectedStaffIds.includes(s.id))
    .map(s => s.name);

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

      {/* Bulk Location Assignment */}
      <BulkLocationAssignment
        selectedStaffIds={selectedStaffIds}
        selectedStaffNames={selectedStaffNames}
        onSuccess={() => {
          // Refresh the staff list
          window.location.reload();
        }}
        onClear={() => setSelectedStaffIds([])}
      />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>All Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || isEnrichedLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No staff found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="py-2 pr-4 w-12">
                      <Checkbox
                        checked={selectedStaffIds.length === filtered.length && filtered.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </th>
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
                        <Checkbox
                          checked={selectedStaffIds.includes(s.id)}
                          onCheckedChange={(checked) => handleStaffSelection(s.id, !!checked)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </td>
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
