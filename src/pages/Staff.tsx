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

// Error Boundaries
import { ErrorBoundary, PageErrorBoundary } from "@/components/error-boundaries/ErrorBoundary";

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
    reviewStatus: null,
    staffStatus: null,
    role: null,
  });

  // Optimized: Fetch all data in parallel with 2 queries
  const { data = [], isLoading } = useQuery<StaffListItem[]>({
    queryKey: ["staffList"],
    queryFn: fetchStaffList,
  });

  // Optimized data query for 2.0 architecture (contracts_enriched_v2 empty)
  const { data: enrichedData, isLoading: isEnrichedLoading } = useQuery({
    queryKey: ["staff-2.0-optimized"],
    queryFn: async () => {
      // Silently query staff data - no logs needed

      // Only query staff_with_lms_data (fast) - contracts_enriched_v2 is empty anyway
      const { data: staffResult, error: staffError } = await supabase
        .from("staff_with_lms_data")
        .select("id, employes_id, full_name, role, location, email, birth_date, last_sync_at, lms_location, is_intern, intern_year, custom_role");

      if (staffError) {
        throw staffError;
      }

      return {
        enriched: [], // Empty - contracts_enriched_v2 is empty
        staff: staffResult ?? [],
        docs: [], // Skip docs query for speed
      };
    },
  });

  // Create optimized lookup maps
  const { flagsByStaffId, enrichedStaffMap, staffDetailsMap, docsMap } = useMemo(() => {
    if (!enrichedData) {
      return {
        flagsByStaffId: new Map(),
        enrichedStaffMap: new Map(), 
        staffDetailsMap: new Map(),
        docsMap: new Map(),
      };
    }

    const flags = new Map<string, {
      has_five_star_badge?: boolean | null;
      needs_six_month_review?: boolean | null;
      needs_yearly_review?: boolean | null;
    }>();
    
    const enriched = new Map();
    const staffDetails = new Map();
    const docs = new Map();

    // Process enriched contract data - join with staff via employes_id
    enrichedData.enriched?.forEach((item: any) => {
      // Find matching staff by employes_id
      const matchingStaff = enrichedData.staff?.find((s: any) => s.employes_id === item.employes_employee_id);
      const staffId = matchingStaff?.id;
      
      if (staffId) {
        flags.set(staffId, {
          has_five_star_badge: item.has_five_star_badge,
          needs_six_month_review: item.needs_six_month_review,
          needs_yearly_review: item.needs_yearly_review,
        });
        enriched.set(staffId, {
          manager: item.manager_key,
          location: item.location_key,
          position: item.position,
          contract_end_date: item.contract_end_date,  // Use contract_end_date consistently
        });
      }
    });

    // Process staff intern details and LMS data
    enrichedData.staff?.forEach((staff: any) => {
      staffDetails.set(staff.id, {
        is_intern: staff.is_intern,
        intern_year: staff.intern_year,
        role: staff.role,
        status: staff.status,
        lms_location: staff.lms_location, // LMS-assigned location
        api_location: staff.location, // API location from Employes.nl
      });
    });

    // Process docs status
    enrichedData.docs?.forEach((doc: any) => {
      if (doc.staff_id) {
        docs.set(doc.staff_id, {
          missing_count: doc.missing_count,
        });
      }
    });

    return {
      flagsByStaffId: flags,
      enrichedStaffMap: enriched,
      staffDetailsMap: staffDetails,
      docsMap: docs,
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

    if (filters.missingDocs) {
      result = result.filter(s => {
        const docs = docsMap.get(s.id);
        return docs?.missing_count > 0;
      });
    }

    if (filters.contractStatus) {
      if (filters.contractStatus === 'active') {
        result = result.filter(s => s.active);
      } else if (filters.contractStatus === 'ended') {
        result = result.filter(s => !s.active);
      } else if (filters.contractStatus === 'expiring') {
        result = result.filter(s => {
          const enriched = enrichedStaffMap.get(s.id);
          if (!enriched?.contract_end_date) return false;
          const endDate = new Date(enriched.contract_end_date);
          const now = new Date();
          const daysDiff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff > 0 && daysDiff <= 30; // Expiring within 30 days
        });
      }
    }

    if (filters.reviewStatus) {
      result = result.filter(s => {
        const flags = flagsByStaffId.get(s.id);
        if (filters.reviewStatus === 'needs_six_month') {
          return flags?.needs_six_month_review === true;
        } else if (filters.reviewStatus === 'needs_yearly') {
          return flags?.needs_yearly_review === true;
        } else if (filters.reviewStatus === 'overdue') {
          return !s.hasRecentReview;
        } else if (filters.reviewStatus === 'up_to_date') {
          return s.hasRecentReview;
        }
        return true;
      });
    }

    if (filters.staffStatus) {
      result = result.filter(s => {
        const staffDetail = staffDetailsMap.get(s.id);
        if (filters.staffStatus === 'active') {
          return staffDetail?.status === 'active' || s.active;
        } else if (filters.staffStatus === 'inactive') {
          return staffDetail?.status === 'inactive' || !s.active;
        }
        return true;
      });
    }

    if (filters.role) {
      result = result.filter(s => {
        const staffDetail = staffDetailsMap.get(s.id);
        return staffDetail?.role === filters.role || s.role === filters.role;
      });
    }

    return result;
  }, [data, query, filters, enrichedStaffMap, staffDetailsMap, flagsByStaffId, docsMap]);

  const getManagerDisplayName = (managerKey: string | null) => {
    const managers: Record<string, string> = {
      'sofia': 'Sofia',
      'pamela': 'Pamela',
      'antonella': 'Antonella',
      'meral': 'Meral',
      'numa': 'Numa',
      'svetlana': 'Svetlana'
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
    <PageErrorBoundary>
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
      <ErrorBoundary componentName="StaffActionCards">
        <StaffActionCards />
      </ErrorBoundary>

      {/* Filter Bar */}
      <ErrorBoundary componentName="StaffFilterBar">
        <StaffFilterBar filters={filters} onFiltersChange={setFilters} />
      </ErrorBoundary>

      {/* Bulk Location Assignment */}
      <ErrorBoundary componentName="BulkLocationAssignment">
        <BulkLocationAssignment
          selectedStaffIds={selectedStaffIds}
          selectedStaffNames={selectedStaffNames}
          onSuccess={() => {
            // Refresh the staff list
            window.location.reload();
          }}
          onClear={() => setSelectedStaffIds([])}
        />
      </ErrorBoundary>

      <ErrorBoundary componentName="StaffTable">
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
                            {/* Show LMS location if assigned, otherwise show API location */}
                            {staffDetailsMap.get(s.id)?.lms_location ? (
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3" />
                                <span>{staffDetailsMap.get(s.id)?.lms_location}</span>
                              </div>
                            ) : staffDetailsMap.get(s.id)?.api_location ? (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{staffDetailsMap.get(s.id)?.api_location}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
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
      </ErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}
