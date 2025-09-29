import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { ConflictResolutionDialog } from './ConflictResolutionDialog';
import { AlertTriangle, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface SyncConflict {
  id: string;
  employes_employee_id: string;
  staff_id?: string;
  conflict_type: string;
  employes_data: any;
  lms_data: any;
  resolution_status: 'pending' | 'resolved' | 'ignored';
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export const ConflictManagementPanel = () => {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  useEffect(() => {
    loadConflicts();
  }, [filter]);

  const loadConflicts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('staff_sync_conflicts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('resolution_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConflicts(data || []);
    } catch (error) {
      console.error('Failed to load conflicts:', error);
      toast.error('Failed to load conflicts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewConflict = (conflict: SyncConflict) => {
    // Parse conflicts from data comparison
    const conflicts: string[] = [];
    
    if (conflict.employes_data && conflict.lms_data) {
      const employesData = conflict.employes_data;
      const lmsData = conflict.lms_data;

      // Compare key fields
      const employesName = `${employesData.first_name || ''} ${employesData.surname || ''}`.trim();
      if (employesName !== lmsData.full_name) {
        conflicts.push(`Name: LMS="${lmsData.full_name}" vs Employes="${employesName}"`);
      }

      if (employesData.email && lmsData.email && employesData.email !== lmsData.email) {
        conflicts.push(`Email: LMS="${lmsData.email}" vs Employes="${employesData.email}"`);
      }

      if (employesData.phone_number && lmsData.phone_number && employesData.phone_number !== lmsData.phone_number) {
        conflicts.push(`Phone: LMS="${lmsData.phone_number}" vs Employes="${employesData.phone_number}"`);
      }
    }

    setSelectedConflict({
      id: conflict.id,
      employesEmployeeId: conflict.employes_employee_id,
      lmsStaffId: conflict.staff_id,
      conflictType: conflict.conflict_type,
      employesData: conflict.employes_data,
      lmsData: conflict.lms_data,
      conflicts
    });
    setDialogOpen(true);
  };

  const handleResolveConflict = async (resolution: {
    conflictId: string;
    resolution: 'use_employes' | 'use_lms' | 'manual';
    notes?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('staff_sync_conflicts')
        .update({
          resolution_status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', resolution.conflictId);

      if (error) throw error;

      // If resolution is to use Employes data, sync it
      if (resolution.resolution === 'use_employes' && selectedConflict) {
        const { employes_data, staff_id } = conflicts.find(c => c.id === resolution.conflictId) || {};
        if (employes_data && staff_id) {
          // Transform and update staff record
          const updateData = {
            full_name: `${employes_data.first_name} ${employes_data.surname || ''}`.trim(),
            email: employes_data.email,
            phone_number: employes_data.phone_number,
            employes_id: employes_data.id,
            last_sync_at: new Date().toISOString()
          };

          await supabase
            .from('staff')
            .update(updateData)
            .eq('id', staff_id);
        }
      }

      toast.success('Conflict resolved successfully');
      await loadConflicts();
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="gap-1 text-green-600 border-green-600"><CheckCircle className="h-3 w-3" /> Resolved</Badge>;
      case 'ignored':
        return <Badge variant="outline" className="gap-1 text-gray-600 border-gray-600"><XCircle className="h-3 w-3" /> Ignored</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = conflicts.filter(c => c.resolution_status === 'pending').length;
  const resolvedCount = conflicts.filter(c => c.resolution_status === 'resolved').length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Data Conflicts
          </CardTitle>
          <CardDescription>
            Manage and resolve data conflicts between Employes.nl and LMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                <div className="text-xs text-muted-foreground">Pending Resolution</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg border">
                <div className="text-2xl font-bold">{conflicts.length}</div>
                <div className="text-xs text-muted-foreground">Total Conflicts</div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending ({pendingCount})
              </Button>
              <Button
                variant={filter === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('resolved')}
              >
                Resolved ({resolvedCount})
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({conflicts.length})
              </Button>
            </div>

            {/* Conflicts Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Loading conflicts...</p>
              </div>
            ) : conflicts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">No conflicts found</p>
                <p className="text-muted-foreground">
                  {filter === 'pending' 
                    ? 'All data is synchronized without conflicts'
                    : `No ${filter} conflicts to display`
                  }
                </p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Conflict Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conflicts.map((conflict) => (
                      <TableRow key={conflict.id}>
                        <TableCell className="font-mono text-xs">
                          {conflict.employes_employee_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{conflict.conflict_type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(conflict.resolution_status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(conflict.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewConflict(conflict)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {conflict.resolution_status === 'pending' ? 'Resolve' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConflictResolutionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        conflict={selectedConflict}
        onResolve={handleResolveConflict}
      />
    </>
  );
};
