/**
 * AddCommentModal Component
 * 
 * Simple modal for adding timeline comments
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquare, Calendar } from "lucide-react";

interface AddCommentModalProps {
  open: boolean;
  onClose: () => void;
  staffName: string;
  onSave?: (comment: string, date: string) => void;
}

export function AddCommentModal({ 
  open, 
  onClose, 
  staffName,
  onSave 
}: AddCommentModalProps) {
  const [comment, setComment] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!comment.trim()) return;
    
    setIsSaving(true);
    try {
      // TODO: Save to database via API
      console.log('Saving comment:', { comment, date });
      
      if (onSave) {
        onSave(comment, date);
      }
      
      // Reset form
      setComment("");
      setDate(new Date().toISOString().split('T')[0]);
      onClose();
    } catch (error) {
      console.error('Error saving comment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Add Timeline Comment
          </DialogTitle>
          <DialogDescription>
            Add a note or comment to <strong>{staffName}</strong>'s timeline
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="comment-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              id="comment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment-text">Comment</Label>
            <Textarea
              id="comment-text"
              placeholder="Enter your comment or note..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              This will appear on the employment timeline
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!comment.trim() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Comment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
