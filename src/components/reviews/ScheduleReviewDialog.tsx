import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useReviewTemplates, useCreateReviewSchedule } from "@/lib/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";

interface ScheduleReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staffId?: string;
  staffName?: string;
}

export function ScheduleReviewDialog({ 
  isOpen, 
  onClose, 
  staffId,
  staffName 
}: ScheduleReviewDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const { data: templates = [], isLoading: templatesLoading } = useReviewTemplates();
  const createSchedule = useCreateReviewSchedule();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staffId) {
      toast({
        title: "Error",
        description: "No staff member selected",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTemplateId) {
      toast({
        title: "Error",
        description: "Please select a review template",
        variant: "destructive"
      });
      return;
    }

    if (!scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive"
      });
      return;
    }

    try {
      await createSchedule.mutateAsync({
        staff_id: staffId,
        template_id: selectedTemplateId,
        scheduled_date: scheduledDate,
        status: 'pending',
        notes: notes || null
      });

      toast({
        title: "Review Scheduled!",
        description: `Review for ${staffName || 'staff member'} scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
      });

      // Reset form
      setSelectedTemplateId('');
      setScheduledDate('');
      setNotes('');
      
      onClose();
    } catch (error) {
      console.error('Failed to schedule review:', error);
      toast({
        title: "Error",
        description: "Failed to schedule review. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Future Review
          </DialogTitle>
          <DialogDescription>
            Plan a review for {staffName || 'this staff member'} to be completed later. You'll receive a notification when it's due.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">
              Review Type <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Select review type..." />
              </SelectTrigger>
              <SelectContent>
                {templatesLoading ? (
                  <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                ) : templates.length === 0 ? (
                  <SelectItem value="none" disabled>No templates available</SelectItem>
                ) : (
                  templates.map((template: any) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the type of review to conduct (e.g., 6-Month, Annual, Probation)
            </p>
          </div>

          {/* Scheduled Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-muted-foreground">
              When should this review be completed?
            </p>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Planning Notes <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g., Focus on project management skills, discuss promotion readiness..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Add any notes or reminders for when you conduct this review
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This will create a reminder to complete the review later. 
              The actual review will be filled out when you click "Complete Review" on the due date.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createSchedule.isPending}
              className="bg-gradient-primary"
            >
              {createSchedule.isPending ? "Scheduling..." : "Schedule Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

