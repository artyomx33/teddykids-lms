import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import { useState } from "react";

export type StaffFilters = {
  internsOnly: boolean;
  internYear: string | null;
  manager: string | null;
  location: string | null;
  missingDocs: boolean;
  contractStatus: string | null;
  reviewStatus: string | null;
  staffStatus: string | null;
  role: string | null;
};

interface StaffFilterBarProps {
  filters: StaffFilters;
  onFiltersChange: (filters: StaffFilters) => void;
}

export function StaffFilterBar({ filters, onFiltersChange }: StaffFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== null && value !== false
  );

  const clearFilters = () => {
    onFiltersChange({
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
  };

  const updateFilter = (key: keyof StaffFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(
      (value) => value !== null && value !== false
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle & Active Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        {/* Active Filter Badges */}
        {filters.internsOnly && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Interns Only
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => updateFilter('internsOnly', false)}
            />
          </Badge>
        )}
        
        {filters.internYear && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Year {filters.internYear}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => updateFilter('internYear', null)}
            />
          </Badge>
        )}
        
        {filters.manager && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Manager: {filters.manager}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => updateFilter('manager', null)}
            />
          </Badge>
        )}
        
        {filters.location && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {filters.location}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => updateFilter('location', null)}
            />
          </Badge>
        )}
        
        {filters.missingDocs && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Missing Docs
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => updateFilter('missingDocs', false)}
            />
          </Badge>
        )}
        
        {filters.contractStatus && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {filters.contractStatus}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => updateFilter('contractStatus', null)}
            />
          </Badge>
        )}
        
        {filters.reviewStatus && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Review: {filters.reviewStatus}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => updateFilter('reviewStatus', null)}
            />
          </Badge>
        )}
        
        {filters.staffStatus && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Status: {filters.staffStatus}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => updateFilter('staffStatus', null)}
            />
          </Badge>
        )}
        
        {filters.role && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Role: {filters.role}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => updateFilter('role', null)}
            />
          </Badge>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Expanded Filter Controls */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 bg-muted/50 rounded-lg">
          {/* Interns Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Staff Type</label>
            <Select
              value={filters.internsOnly ? "interns" : "all"}
              onValueChange={(value) => updateFilter('internsOnly', value === "interns")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="interns">Interns Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Intern Year */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Intern Year</label>
            <Select
              value={filters.internYear || "all"}
              onValueChange={(value) => updateFilter('internYear', value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any year</SelectItem>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manager */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Manager</label>
            <Select
              value={filters.manager || "all"}
              onValueChange={(value) => updateFilter('manager', value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any manager</SelectItem>
                <SelectItem value="sofia">Sofia</SelectItem>
                <SelectItem value="pamela">Pamela</SelectItem>
                <SelectItem value="antonella">Antonella</SelectItem>
                <SelectItem value="meral">Meral</SelectItem>
                <SelectItem value="numa">Numa</SelectItem>
                <SelectItem value="svetlana">Svetlana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Select
              value={filters.location || "all"}
              onValueChange={(value) => updateFilter('location', value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any location</SelectItem>
                <SelectItem value="rbw">Rijnsburgerweg 35</SelectItem>
                <SelectItem value="zml">Zeemanlaan 22a</SelectItem>
                <SelectItem value="lrz">Lorentzkade 15a</SelectItem>
                <SelectItem value="rb3&5">Rijnsburgerweg 3&5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Missing Docs */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Documents</label>
            <Select
              value={filters.missingDocs ? "missing" : "all"}
              onValueChange={(value) => updateFilter('missingDocs', value === "missing")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="missing">Missing Docs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contract Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Contract Status</label>
            <Select
              value={filters.contractStatus || "all"}
              onValueChange={(value) => updateFilter('contractStatus', value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Review Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Review Status</label>
            <Select
              value={filters.reviewStatus || "all"}
              onValueChange={(value) => updateFilter('reviewStatus', value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any review status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any review status</SelectItem>
                <SelectItem value="needs_six_month">Needs 6-month</SelectItem>
                <SelectItem value="needs_yearly">Needs yearly</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="up_to_date">Up to date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Staff Status</label>
            <Select
              value={filters.staffStatus || "all"}
              onValueChange={(value) => updateFilter('staffStatus', value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any staff status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any staff status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select
              value={filters.role || "all"}
              onValueChange={(value) => updateFilter('role', value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any role</SelectItem>
                <SelectItem value="pedagogisch_medewerker">Pedagogisch Medewerker</SelectItem>
                <SelectItem value="leidinggevende">Leidinggevende</SelectItem>
                <SelectItem value="stagiair">Stagiair</SelectItem>
                <SelectItem value="ondersteunend">Ondersteunend Personeel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}