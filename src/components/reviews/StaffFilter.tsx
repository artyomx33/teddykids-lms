import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Filter,
  X,
  ChevronDown,
  Search,
  Star,
  Calendar,
  Clock,
  Users,
  Building2,
  Briefcase,
  AlertTriangle
} from 'lucide-react';

interface FilterCriteria {
  search: string;
  department: string[];
  position: string[];
  reviewStatus: string[];
  performanceLevel: string[];
  starRating: { min: number; max: number };
  reviewType: string[];
  dateRange: { start: string; end: string };
  overdueOnly: boolean;
  topPerformersOnly: boolean;
  needsAttentionOnly: boolean;
  hasReviews: boolean;
  contractStatus: string[];
}

interface StaffFilterProps {
  onFilterChange: (filters: FilterCriteria) => void;
  availableOptions?: {
    departments: string[];
    positions: string[];
    contractStatuses: string[];
  };
  activeFiltersCount?: number;
  className?: string;
}

const initialFilters: FilterCriteria = {
  search: '',
  department: [],
  position: [],
  reviewStatus: [],
  performanceLevel: [],
  starRating: { min: 0, max: 5 },
  reviewType: [],
  dateRange: { start: '', end: '' },
  overdueOnly: false,
  topPerformersOnly: false,
  needsAttentionOnly: false,
  hasReviews: true,
  contractStatus: []
};

const reviewStatuses = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' }
];

const performanceLevels = [
  { value: 'exceptional', label: 'Exceptional (4.5-5.0★)' },
  { value: 'exceeds', label: 'Exceeds (3.5-4.4★)' },
  { value: 'meets', label: 'Meets (2.5-3.4★)' },
  { value: 'below', label: 'Below (1.5-2.4★)' },
  { value: 'unsatisfactory', label: 'Unsatisfactory (1.0-1.4★)' }
];

const reviewTypes = [
  { value: 'six_month', label: '6-Month Review' },
  { value: 'yearly', label: 'Yearly Review' },
  { value: 'performance', label: 'Performance Review' },
  { value: 'probation', label: 'Probation Review' },
  { value: 'exit', label: 'Exit Review' }
];

const quickFilters = [
  { key: 'overdueOnly', label: 'Overdue Reviews', icon: AlertTriangle, color: 'text-red-600' },
  { key: 'topPerformersOnly', label: 'Top Performers (4.5+★)', icon: Star, color: 'text-yellow-600' },
  { key: 'needsAttentionOnly', label: 'Needs Attention', icon: AlertTriangle, color: 'text-orange-600' }
];

export function StaffFilter({
  onFilterChange,
  availableOptions = { departments: [], positions: [], contractStatuses: [] },
  activeFiltersCount = 0,
  className
}: StaffFilterProps) {
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key: keyof FilterCriteria, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [key]: newArray
      };
    });
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;

    if (filters.search) count++;
    if (filters.department.length > 0) count++;
    if (filters.position.length > 0) count++;
    if (filters.reviewStatus.length > 0) count++;
    if (filters.performanceLevel.length > 0) count++;
    if (filters.starRating.min > 0 || filters.starRating.max < 5) count++;
    if (filters.reviewType.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.overdueOnly) count++;
    if (filters.topPerformersOnly) count++;
    if (filters.needsAttentionOnly) count++;
    if (!filters.hasReviews) count++;
    if (filters.contractStatus.length > 0) count++;

    return count;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const renderFilterChips = () => {
    const chips = [];

    if (filters.search) {
      chips.push({ type: 'search', value: filters.search, label: `Search: "${filters.search}"` });
    }

    filters.department.forEach(dept => {
      chips.push({ type: 'department', value: dept, label: `Dept: ${dept}` });
    });

    filters.position.forEach(pos => {
      chips.push({ type: 'position', value: pos, label: `Position: ${pos}` });
    });

    filters.reviewStatus.forEach(status => {
      chips.push({ type: 'reviewStatus', value: status, label: `Status: ${status}` });
    });

    filters.performanceLevel.forEach(level => {
      const levelConfig = performanceLevels.find(p => p.value === level);
      chips.push({ type: 'performanceLevel', value: level, label: levelConfig?.label || level });
    });

    if (filters.overdueOnly) {
      chips.push({ type: 'overdueOnly', value: 'true', label: 'Overdue Only' });
    }

    if (filters.topPerformersOnly) {
      chips.push({ type: 'topPerformersOnly', value: 'true', label: 'Top Performers' });
    }

    if (filters.needsAttentionOnly) {
      chips.push({ type: 'needsAttentionOnly', value: 'true', label: 'Needs Attention' });
    }

    return chips;
  };

  const removeFilterChip = (type: string, value: string) => {
    switch (type) {
      case 'search':
        updateFilter('search', '');
        break;
      case 'department':
        toggleArrayFilter('department', value);
        break;
      case 'position':
        toggleArrayFilter('position', value);
        break;
      case 'reviewStatus':
        toggleArrayFilter('reviewStatus', value);
        break;
      case 'performanceLevel':
        toggleArrayFilter('performanceLevel', value);
        break;
      case 'overdueOnly':
        updateFilter('overdueOnly', false);
        break;
      case 'topPerformersOnly':
        updateFilter('topPerformersOnly', false);
        break;
      case 'needsAttentionOnly':
        updateFilter('needsAttentionOnly', false);
        break;
    }
  };

  const activeFilters = renderFilterChips();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Staff Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length} active
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {activeFilters.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Quick Search */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, position, or department..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filter Toggles */}
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((quickFilter) => {
                const Icon = quickFilter.icon;
                const isActive = filters[quickFilter.key as keyof FilterCriteria] as boolean;

                return (
                  <Button
                    key={quickFilter.key}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter(quickFilter.key as keyof FilterCriteria, !isActive)}
                    className={isActive ? '' : 'hover:border-current'}
                  >
                    <Icon className={`h-4 w-4 mr-1 ${quickFilter.color}`} />
                    {quickFilter.label}
                  </Button>
                );
              })}
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((chip, index) => (
                  <Badge
                    key={`${chip.type}-${chip.value}-${index}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {chip.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilterChip(chip.type, chip.value)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {isExpanded && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Basic Filters */}
              <Collapsible
                open={expandedSections.includes('basic')}
                onOpenChange={() => toggleSection('basic')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Basic Information</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.includes('basic') ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Department Filter */}
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value="" onValueChange={(value) => toggleArrayFilter('department', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={`${filters.department.length} selected`} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOptions.departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              <div className="flex items-center gap-2">
                                <Checkbox checked={filters.department.includes(dept)} />
                                {dept}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Position Filter */}
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value="" onValueChange={(value) => toggleArrayFilter('position', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={`${filters.position.length} selected`} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOptions.positions.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              <div className="flex items-center gap-2">
                                <Checkbox checked={filters.position.includes(pos)} />
                                {pos}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Contract Status */}
                    <div className="space-y-2">
                      <Label>Contract Status</Label>
                      <Select value="" onValueChange={(value) => toggleArrayFilter('contractStatus', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={`${filters.contractStatus.length} selected`} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOptions.contractStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <Checkbox checked={filters.contractStatus.includes(status)} />
                                {status}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Review Filters */}
              <Collapsible
                open={expandedSections.includes('reviews')}
                onOpenChange={() => toggleSection('reviews')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">Review Information</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.includes('reviews') ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Review Status */}
                      <div className="space-y-2">
                        <Label>Review Status</Label>
                        <div className="space-y-2">
                          {reviewStatuses.map((status) => (
                            <div key={status.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`status-${status.value}`}
                                checked={filters.reviewStatus.includes(status.value)}
                                onCheckedChange={() => toggleArrayFilter('reviewStatus', status.value)}
                              />
                              <Label htmlFor={`status-${status.value}`} className="text-sm">
                                {status.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance Level */}
                      <div className="space-y-2">
                        <Label>Performance Level</Label>
                        <div className="space-y-2">
                          {performanceLevels.map((level) => (
                            <div key={level.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`level-${level.value}`}
                                checked={filters.performanceLevel.includes(level.value)}
                                onCheckedChange={() => toggleArrayFilter('performanceLevel', level.value)}
                              />
                              <Label htmlFor={`level-${level.value}`} className="text-sm">
                                {level.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Review Type */}
                      <div className="space-y-2">
                        <Label>Review Type</Label>
                        <div className="space-y-2">
                          {reviewTypes.map((type) => (
                            <div key={type.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`type-${type.value}`}
                                checked={filters.reviewType.includes(type.value)}
                                onCheckedChange={() => toggleArrayFilter('reviewType', type.value)}
                              />
                              <Label htmlFor={`type-${type.value}`} className="text-sm">
                                {type.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Range */}
                    <div className="space-y-2">
                      <Label>Star Rating Range</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="min-rating" className="text-sm">Min:</Label>
                          <Select
                            value={filters.starRating.min.toString()}
                            onValueChange={(value) => updateFilter('starRating', { ...filters.starRating, min: parseInt(value) })}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[0, 1, 2, 3, 4, 5].map((rating) => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  {rating}★
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="max-rating" className="text-sm">Max:</Label>
                          <Select
                            value={filters.starRating.max.toString()}
                            onValueChange={(value) => updateFilter('starRating', { ...filters.starRating, max: parseInt(value) })}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[0, 1, 2, 3, 4, 5].map((rating) => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  {rating}★
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Date Filters */}
              <Collapsible
                open={expandedSections.includes('dates')}
                onOpenChange={() => toggleSection('dates')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Date Filters</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.includes('dates') ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Review Date From</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">Review Date To</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Additional Options */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-reviews"
                    checked={filters.hasReviews}
                    onCheckedChange={(checked) => updateFilter('hasReviews', checked)}
                  />
                  <Label htmlFor="has-reviews">Only show staff with reviews</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}