import { useState } from "react";
import { Calendar, Star, User, FileText, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember?: {
    id: string;
    name: string;
    position: string;
  };
}

export function ReviewModal({ isOpen, onClose, staffMember }: ReviewModalProps) {
  const [formData, setFormData] = useState({
    reviewDate: new Date().toISOString().split('T')[0],
    reviewType: "",
    score: 0,
    summary: "",
    raiseRecommended: false,
    goals: "",
    strengths: "",
    improvements: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleScoreSelect = (score: number) => {
    setFormData(prev => ({ ...prev, score }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Review Saved Successfully",
        description: `Review for ${staffMember?.name} has been recorded.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            New Performance Review
          </DialogTitle>
          <DialogDescription>
            {staffMember ? `Create review for ${staffMember.name} (${staffMember.position})` : "Create a new staff review"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewType">Review Type</Label>
              <Select value={formData.reviewType} onValueChange={(value) => setFormData(prev => ({ ...prev, reviewType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select review type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="probation">Probation Review</SelectItem>
                  <SelectItem value="6-month">6-Month Review</SelectItem>
                  <SelectItem value="annual">Annual Review</SelectItem>
                  <SelectItem value="performance">Performance Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Score Selection */}
          <div className="space-y-3">
            <Label>Overall Performance Score</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleScoreSelect(star)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    formData.score >= star
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-muted hover:border-primary/30'
                  }`}
                >
                  <Star className={`w-6 h-6 ${formData.score >= star ? 'fill-current' : ''}`} />
                </button>
              ))}
              {formData.score > 0 && (
                <Badge variant="outline" className="ml-2 self-center">
                  {formData.score === 5 ? "⭐ Exceptional" : 
                   formData.score === 4 ? "🌟 Exceeds Expectations" :
                   formData.score === 3 ? "✅ Meets Expectations" :
                   formData.score === 2 ? "⚠️ Below Expectations" : "❌ Needs Improvement"}
                </Badge>
              )}
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summary">Review Summary</Label>
              <Textarea
                id="summary"
                placeholder="Overall performance summary..."
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="strengths">Key Strengths</Label>
                <Textarea
                  id="strengths"
                  placeholder="What does this person do well?"
                  value={formData.strengths}
                  onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="improvements">Areas for Improvement</Label>
                <Textarea
                  id="improvements"
                  placeholder="What could be improved?"
                  value={formData.improvements}
                  onChange={(e) => setFormData(prev => ({ ...prev, improvements: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Goals for Next Period</Label>
              <Textarea
                id="goals"
                placeholder="What are the goals for the next review period?"
                value={formData.goals}
                onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Raise Recommendation */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-success" />
              <div>
                <Label htmlFor="raiseRecommended" className="text-sm font-medium cursor-pointer">
                  Recommend for Raise/Promotion
                </Label>
                <p className="text-xs text-muted-foreground">
                  Based on performance, recommend salary increase or promotion
                </p>
              </div>
            </div>
            <Switch
              id="raiseRecommended"
              checked={formData.raiseRecommended}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, raiseRecommended: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-primary">
              {isSubmitting ? "Saving..." : "Save Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}