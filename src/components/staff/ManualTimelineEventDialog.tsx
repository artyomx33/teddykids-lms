/**
 * ManualTimelineEventDialog Component
 * 
 * Dialog for adding historical timeline events manually
 * Used for adding paper/PDF contracts from before 2004
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Upload, FileText, Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ManualTimelineEventDialogProps {
  employeeId: string;
  employeeName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualTimelineEventDialog({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: ManualTimelineEventDialogProps) {
  const queryClient = useQueryClient();
  
  // Form state
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [monthlySalary, setMonthlySalary] = useState<string>('');
  const [hoursPerWeek, setHoursPerWeek] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setEventDate(undefined);
    setMonthlySalary('');
    setHoursPerWeek('');
    setNotes('');
    setContractFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      // Validate file type (PDFs only for contracts)
      if (!file.type.includes('pdf')) {
        toast.error('Only PDF files are allowed for contracts');
        e.target.value = '';
        return;
      }
      setContractFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!eventDate) {
      toast.error('Please select an event date');
      return;
    }

    if (!notes.trim()) {
      toast.error('Please provide notes about this historical event');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to add timeline events');
        return;
      }

      let contractPdfPath = null;

      // Upload contract PDF if provided
      if (contractFile) {
        const fileName = `${employeeId}/${Date.now()}_${contractFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(fileName, contractFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading contract:', uploadError);
          toast.error('Failed to upload contract PDF');
          return;
        }

        contractPdfPath = uploadData.path;
      }

      // Insert manual timeline event
      const { error: insertError } = await supabase
        .from('employes_timeline_v2')
        .insert({
          employee_id: employeeId,
          event_type: 'manual_adjustment',
          event_title: 'Manual Historical Entry', // Required NOT NULL field
          event_date: format(eventDate, 'yyyy-MM-dd'),
          event_description: `Historical entry: ${notes.substring(0, 100)}${notes.length > 100 ? '...' : ''}`,
          is_manual: true,
          manual_notes: notes,
          month_wage_at_event: monthlySalary ? parseFloat(monthlySalary) : null,
          hours_per_week_at_event: hoursPerWeek ? parseFloat(hoursPerWeek) : null,
          contract_pdf_path: contractPdfPath,
          created_by: user.id,
        });

      if (insertError) {
        console.error('Error inserting manual event:', insertError);
        toast.error('Failed to add timeline event: ' + insertError.message);
        return;
      }

      toast.success('Historical event added successfully');
      
      // Invalidate timeline query to refresh
      queryClient.invalidateQueries({ queryKey: ['employee-timeline-complete', employeeId] });
      
      // Close dialog and reset form
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error adding manual timeline event:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close handler with form reset
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-pink-600" />
            Add Historical Event
          </DialogTitle>
          <DialogDescription>
            Add a manual timeline entry for historical contracts or events
            {employeeName && ` for ${employeeName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Date */}
          <div className="space-y-2">
            <Label htmlFor="event-date">Event Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                  disabled={(date) => date > new Date()} // Can't be in the future
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              The date when this contract or event occurred
            </p>
          </div>

          {/* Monthly Salary */}
          <div className="space-y-2">
            <Label htmlFor="monthly-salary">Monthly Gross Salary (€)</Label>
            <Input
              id="monthly-salary"
              type="number"
              step="0.01"
              placeholder="e.g., 2500.00"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Optional - Leave blank if not applicable
            </p>
          </div>

          {/* Hours per Week */}
          <div className="space-y-2">
            <Label htmlFor="hours-per-week">Hours per Week</Label>
            <Input
              id="hours-per-week"
              type="number"
              step="0.1"
              placeholder="e.g., 40.0"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Optional - Leave blank if not applicable
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes *</Label>
            <Textarea
              id="notes"
              placeholder="Describe this historical event: source of info, contract type, reason for manual entry, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Required - Explain why this event is being added manually
            </p>
          </div>

          {/* Contract PDF Upload */}
          <div className="space-y-2">
            <Label htmlFor="contract-pdf">Contract PDF (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="contract-pdf"
                type="file"
                onChange={handleFileChange}
                disabled={isSubmitting}
                accept=".pdf"
                className="cursor-pointer"
              />
              {contractFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setContractFile(null)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {contractFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="truncate">{contractFile.name}</span>
                <span>({(contractFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              PDF only, max 10MB - Attach scanned historical contract if available
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!eventDate || !notes.trim() || isSubmitting}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {isSubmitting ? (
                <>Adding...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Historical Event
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

