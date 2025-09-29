import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, Database, Building2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ConflictData {
  id: string;
  employesEmployeeId: string;
  lmsStaffId?: string;
  conflictType: string;
  employesData: any;
  lmsData: any;
  conflicts: string[];
}

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: ConflictData | null;
  onResolve: (resolution: {
    conflictId: string;
    resolution: 'use_employes' | 'use_lms' | 'manual';
    notes?: string;
    mergedData?: any;
  }) => Promise<void>;
}

export const ConflictResolutionDialog = ({
  open,
  onOpenChange,
  conflict,
  onResolve
}: ConflictResolutionDialogProps) => {
  const [resolutionType, setResolutionType] = useState<'use_employes' | 'use_lms' | 'manual'>('use_employes');
  const [notes, setNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!conflict) return null;

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await onResolve({
        conflictId: conflict.id,
        resolution: resolutionType,
        notes: notes || undefined,
      });
      toast.success('Conflict resolved successfully');
      onOpenChange(false);
      setNotes('');
      setResolutionType('use_employes');
    } catch (error) {
      toast.error('Failed to resolve conflict');
    } finally {
      setIsResolving(false);
    }
  };

  const DataComparisonCard = ({ title, data, icon: Icon, variant }: any) => (
    <Card className={variant === 'employes' ? 'border-blue-500' : 'border-amber-500'}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{data.full_name || `${data.first_name} ${data.surname}`}</span>
          </div>
          {data.email && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{data.email}</span>
            </div>
          )}
          {data.phone_number && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{data.phone_number}</span>
            </div>
          )}
          {(data.hourly_wage || data.employment?.salary?.hour_wage) && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Hourly Wage:</span>
              <span className="font-medium">
                €{data.hourly_wage || data.employment?.salary?.hour_wage}
              </span>
            </div>
          )}
          {(data.start_date || data.employment?.start_date) && (
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">
                {data.start_date || data.employment?.start_date?.split('T')[0]}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Resolve Data Conflict
          </DialogTitle>
          <DialogDescription>
            Compare data from both systems and choose how to resolve this conflict
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Conflict Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              {conflict.conflictType}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {conflict.conflicts.length} field{conflict.conflicts.length !== 1 ? 's' : ''} in conflict
            </span>
          </div>

          {/* Conflict Details */}
          {conflict.conflicts.length > 0 && (
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Conflicting Fields
                </h4>
                <ul className="space-y-1 text-sm">
                  {conflict.conflicts.map((c, idx) => (
                    <li key={idx} className="text-amber-800 dark:text-amber-200">
                      • {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Data Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <DataComparisonCard
              title="Employes.nl Data (Source of Truth)"
              data={conflict.employesData}
              icon={Building2}
              variant="employes"
            />
            <DataComparisonCard
              title="LMS Data (Current)"
              data={conflict.lmsData}
              icon={Database}
              variant="lms"
            />
          </div>

          {/* Resolution Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Choose Resolution Strategy</h3>
            <RadioGroup value={resolutionType} onValueChange={(v: any) => setResolutionType(v)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="use_employes" id="use_employes" />
                <Label htmlFor="use_employes" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">Use Employes.nl Data</p>
                      <p className="text-xs text-muted-foreground">
                        Replace LMS data with Employes.nl data (recommended)
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="use_lms" id="use_lms" />
                <Label htmlFor="use_lms" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="font-medium">Keep LMS Data</p>
                      <p className="text-xs text-muted-foreground">
                        Preserve current LMS data and ignore Employes.nl changes
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Mark as Resolved</p>
                      <p className="text-xs text-muted-foreground">
                        Mark this conflict as manually resolved without changes
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="resolution-notes">Resolution Notes (Optional)</Label>
            <Textarea
              id="resolution-notes"
              placeholder="Add any notes about this resolution decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isResolving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={isResolving}
          >
            {isResolving ? 'Resolving...' : 'Resolve Conflict'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
