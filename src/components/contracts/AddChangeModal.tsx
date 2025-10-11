/**
 * AddChangeModal Component
 * 
 * Modal for adding contract changes
 * Options: Contract Renewal, Salary Change, Hours Change, Position Change, Location Change
 */

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Briefcase, 
  MapPin,
  Calendar,
  ChevronRight
} from "lucide-react";

interface AddChangeModalProps {
  open: boolean;
  onClose: () => void;
  staffName: string;
}

interface ChangeOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export function AddChangeModal({ open, onClose, staffName }: AddChangeModalProps) {
  const changeOptions: ChangeOption[] = [
    {
      id: 'contract_renewal',
      label: 'Contract Renewal',
      description: 'Extend or renew employment contract',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    },
    {
      id: 'salary_change',
      label: 'Salary Change',
      description: 'Adjust monthly salary amount',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
    },
    {
      id: 'hours_change',
      label: 'Hours Change',
      description: 'Modify working hours per week',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    },
    {
      id: 'position_change',
      label: 'Position Change',
      description: 'Update job title or role',
      icon: Briefcase,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    },
    {
      id: 'location_change',
      label: 'Location Change',
      description: 'Change work location or site',
      icon: MapPin,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100 border-red-200',
    },
  ];

  const handleOptionClick = (optionId: string) => {
    console.log('Selected change type:', optionId);
    // TODO: Open specific form based on optionId
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add Contract Change
          </DialogTitle>
          <DialogDescription>
            Select the type of change you want to make for <strong>{staffName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-4">
          {changeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${option.bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`${option.color} p-3 rounded-lg bg-white border`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{option.label}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <div className="font-medium text-orange-600">⚠️ Note:</div>
            <div>
              <strong>Manual Workflow:</strong> After creating a planned change here, 
              a manager will review it, and then a director must approve and implement 
              it via <strong>employes.nl</strong>. Full in-app integration coming soon!
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
