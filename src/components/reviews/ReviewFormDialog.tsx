import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReviewForm } from "./ReviewForm";

interface ReviewFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staffId?: string;
  reviewId?: string;
  reviewType?: 'six_month' | 'yearly' | 'performance' | 'probation' | 'exit' | 'promotion_review' | 'salary_review' | 'warning';
  mode?: 'create' | 'edit' | 'complete';
}

export function ReviewFormDialog({ 
  isOpen, 
  onClose, 
  staffId, 
  reviewId, 
  reviewType, 
  mode = 'create' 
}: ReviewFormDialogProps) {
  const getDialogTitle = () => {
    if (mode === 'create') return 'Schedule New Review';
    if (mode === 'edit') return 'Edit Review';
    return 'Complete Review';
  };

  const getDialogDescription = () => {
    if (mode === 'create') return 'Select a review template and complete the performance evaluation with self-assessment and DISC mini-questions.';
    if (mode === 'edit') return 'Make changes to this review before finalizing.';
    return 'Finalize this review and award XP to the staff member.';
  };

  const handleSave = () => {
    // Close dialog after successful save
    onClose();
    // Optionally trigger a refetch of review data here
    // This could be done via React Query's invalidateQueries
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{getDialogTitle()}</DialogTitle>
          <DialogDescription className="text-base">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ReviewForm
            staffId={staffId}
            reviewId={reviewId}
            reviewType={reviewType}
            mode={mode}
            onSave={handleSave}
            onCancel={onClose}
            className="border-0 shadow-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

