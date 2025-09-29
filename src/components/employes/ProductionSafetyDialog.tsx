import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Database, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductionSafetyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  action: string;
  employeeCount?: number;
  details?: string[];
}

export function ProductionSafetyDialog({
  open,
  onOpenChange,
  onConfirm,
  action,
  employeeCount = 0,
  details = []
}: ProductionSafetyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Production Database Action
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                ⚠️ You are about to {action}
              </p>
              
              {employeeCount > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Affects {employeeCount} employees</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4" />
                <span className="text-sm">This will modify your production database</span>
              </div>
              
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                🚨 IRREVERSIBLE ACTION
              </Badge>
            </div>
            
            {details.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">This action will:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="text-sm font-medium text-red-600">
              Are you absolutely sure you want to continue?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Yes, Execute Action
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}