import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchStaffList, StaffListItem } from "@/lib/staff";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeCard } from "@/components/staff/EmployeeCard";
import { StaffActionCards } from "@/components/staff/StaffActionCards";
import { StaffFilterBar, StaffFilters } from "@/components/staff/StaffFilterBar";
import { BulkLocationAssignment } from "@/components/staff/BulkLocationAssignment";

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
      console.log('🚀 Using 2.0 optimized staff data query');

      // Only query staff table (fast) - contracts_enriched_v2 is empty anyway
      const { data: staffResult, error: staffError } = await supabase
        .from("staff")
        .select("id, employes_id, full_name, role, location, email, birth_date, last_sync_at");

      if (staffError) {
        console.error('Staff query error:', staffError);
        throw staffError;
      }

      console.log(`✅ Loaded ${staffResult?.length || 0} staff members from staff VIEW`);

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
          end_date: item.end_date,
        });
      }
    });

    // Process staff intern details
    enrichedData.staff?.forEach((staff: any) => {
      staffDetails.set(staff.id, {
        is_intern: staff.is_intern,
        intern_year: staff.intern_year,
        role: staff.role,
        status: staff.status,
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
          if (!enriched?.end_date) return false;
          const endDate = new Date(enriched.end_date);
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

  const getStatusLabel = (staffId: string, fallbackActive: boolean) => {
    const detail = staffDetailsMap.get(staffId);
    if (detail?.status) {
      return detail.status === 'active' ? 'Active' : detail.status;
    }
    return fallbackActive ? 'Active' : 'Ended';
  };

  const getBadgeLabel = (staffId: string) => {
    const flags = flagsByStaffId.get(staffId);
    if (flags?.has_five_star_badge) {
      return 'Teddy Star';
    }

    const detail = staffDetailsMap.get(staffId);
    if (detail?.is_intern) {
      return detail.intern_year ? `Intern Y${detail.intern_year}` : 'Intern';
    }

    const docs = docsMap.get(staffId);
    if (docs && docs.missing_count === 0) {
      return 'Docs complete';
    }

    return null;
  };

  const getReviewSummary = (staff: StaffListItem) => {
    const flags = flagsByStaffId.get(staff.id);
    if (flags?.needs_six_month_review) {
      return 'Needs 6-month review';
    }
    if (flags?.needs_yearly_review) {
      return 'Needs yearly review';
    }
    return staff.hasRecentReview ? 'Up to date' : 'No recent review';
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

  const allSelected = filtered.length > 0 && selectedStaffIds.length === filtered.length;

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
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{selectedStaffIds.length} selected</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(!allSelected)}
                    className="text-primary hover:underline"
                  >
                    {allSelected ? 'Clear selection' : 'Select all'}
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((s) => {
                    const enriched = enrichedStaffMap.get(s.id);
                    const detail = staffDetailsMap.get(s.id);
                    return (
                      <EmployeeCard
                        key={s.id}
                        id={s.id}
                        name={s.name}
                        role={detail?.role || s.role}
                        manager={getManagerDisplayName(enriched?.manager ?? null)}
                        location={getLocationDisplayName(enriched?.location ?? null)}
                        status={getStatusLabel(s.id, s.active)}
                        highlight={getReviewSummary(s)}
                        href={`/staff/${s.id}`}
                        selected={selectedStaffIds.includes(s.id)}
                        onSelect={(checked) => handleStaffSelection(s.id, checked)}
                        badge={getBadgeLabel(s.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}
