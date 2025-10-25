/**
 * 📋 RECENT CHANGES PANEL
 * Shows detected changes from the last 24 hours
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, FileText, User, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

interface EmployeeChange {
  id: string;
  employee_id: string;
  employee_name: string;
  change_type: string;
  field_name: string;
  old_value: string;
  new_value: string;
  business_impact: string;
  detected_at: string;
}

export function RecentChangesPanel() {
  const [changes, setChanges] = useState<EmployeeChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentChanges();
  }, []);

  const loadRecentChanges = async () => {
    try {
      setIsLoading(true);
      
      // Get changes from last 24 hours
      const { data, error } = await supabase
        .from('employes_changes')
        .select('*')
        .eq('is_duplicate', false)  // 🎯 FILTER OUT DUPLICATES
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('detected_at', { ascending: false })
        .limit(showAll ? 100 : 10);

      if (error) throw error;

      setChanges(data || []);
    } catch (error) {
      console.error('Failed to load recent changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeIcon = (changeType: string) => {
    if (changeType.includes('salary') || changeType.includes('wage')) {
      return <DollarSign className="h-4 w-4 text-green-500" />;
    }
    if (changeType.includes('hours') || changeType.includes('time')) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    if (changeType.includes('contract')) {
      return <FileText className="h-4 w-4 text-purple-500" />;
    }
    return <User className="h-4 w-4 text-gray-500" />;
  };

  const getChangeTypeLabel = (changeType: string) => {
    const labels: Record<string, string> = {
      'salary_increase': '💰 Salary',
      'salary_decrease': '💰 Salary',
      'hours_change': '⏰ Hours',
      'contract_renewal': '📄 Contract',
      'contract_change': '📄 Contract',
      'status_change': '👤 Status',
      'personal_info_change': '👤 Personal Info',
    };
    return labels[changeType] || '🔸 Change';
  };

  const getTrendIcon = (oldValue: string, newValue: string, fieldName: string) => {
    // Defensive check: fieldName might be undefined
    if (!fieldName) return null;
    
    // For numeric fields, show trend
    if (fieldName.includes('wage') || fieldName.includes('salary') || fieldName.includes('hours')) {
      const oldNum = parseFloat(oldValue);
      const newNum = parseFloat(newValue);
      if (!isNaN(oldNum) && !isNaN(newNum)) {
        if (newNum > oldNum) {
          return <TrendingUp className="h-3 w-3 text-green-500 inline ml-1" />;
        } else if (newNum < oldNum) {
          return <TrendingDown className="h-3 w-3 text-red-500 inline ml-1" />;
        }
      }
    }
    return null;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const changeTime = new Date(timestamp).getTime();
    const diffMs = now - changeTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return 'Today';
  };

  const handleViewStaff = (employeeId: string) => {
    // Navigate to staff profile
    navigate(`/staff/${employeeId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📋 Recent Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading changes...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (changes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📋 Recent Changes (last 24 hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No changes detected in the last 24 hours</p>
            <p className="text-sm mt-1">Run a sync to check for updates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📋 Recent Changes (last 24 hours)</span>
          <Badge variant="secondary">{changes.length} change{changes.length === 1 ? '' : 's'}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {changes.map((change) => (
          <div
            key={change.id}
            className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleViewStaff(change.employee_id)}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Icon & Content */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-1">
                  {getChangeIcon(change.change_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">
                    {getChangeTypeLabel(change.change_type)} {change.employee_name || 'Unknown Employee'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {change.business_impact || (
                      <>
                        {change.field_name}: {change.old_value} → {change.new_value}
                        {getTrendIcon(change.old_value, change.new_value, change.field_name)}
                      </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getTimeAgo(change.detected_at)}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}

        {/* Show More Button */}
        {!showAll && changes.length >= 10 && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setShowAll(true);
              loadRecentChanges();
            }}
          >
            View All Changes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
