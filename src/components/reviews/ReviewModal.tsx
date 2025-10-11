import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember?: {
    id: string;
    name: string;
    position: string;
  };
}

interface ReviewFormState {
  reviewDate: string;
  reviewType: string;
  score: string;
  summary: string;
  strengths: string;
  improvements: string;
  goals: string;
  recommendRaise: boolean;
}

const createInitialState = (): ReviewFormState => ({
  reviewDate: new Date().toISOString().split("T")[0],
  reviewType: "",
  score: "",
  summary: "",
  strengths: "",
  improvements: "",
  goals: "",
  recommendRaise: false,
});

export function ReviewModal({ isOpen, onClose, staffMember }: ReviewModalProps) {
  const [formState, setFormState] = useState<ReviewFormState>(createInitialState());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof ReviewFormState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onClose();
      setFormState(createInitialState());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New performance review</DialogTitle>
          <DialogDescription>
            {staffMember
              ? `Review for ${staffMember.name} (${staffMember.position})`
              : "Record a new staff review"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Review date</span>
              <input
                type="date"
                value={formState.reviewDate}
                onChange={(event) => updateField("reviewDate", event.target.value)}
                className="rounded-md border px-3 py-2"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Review type</span>
              <select
                value={formState.reviewType}
                onChange={(event) => updateField("reviewType", event.target.value)}
                className="rounded-md border px-3 py-2"
                required
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="probation">Probation</option>
                <option value="six-month">6-month</option>
                <option value="annual">Annual</option>
                <option value="performance">Performance</option>
              </select>
            </label>
          </section>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Overall score</legend>
            <div className="flex flex-wrap gap-3 text-sm">
              {["1", "2", "3", "4", "5"].map((score) => (
                <label key={score} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="score"
                    value={score}
                    checked={formState.score === score}
                    onChange={(event) => updateField("score", event.target.value)}
                    required
                  />
                  {score}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Summary</span>
            <textarea
              value={formState.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              className="min-h-[120px] rounded-md border px-3 py-2"
              required
            />
          </label>

          <section className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Strengths</span>
              <textarea
                value={formState.strengths}
                onChange={(event) => updateField("strengths", event.target.value)}
                className="min-h-[80px] rounded-md border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Improvements</span>
              <textarea
                value={formState.improvements}
                onChange={(event) => updateField("improvements", event.target.value)}
                className="min-h-[80px] rounded-md border px-3 py-2"
              />
            </label>
          </section>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Goals for next period</span>
            <textarea
              value={formState.goals}
              onChange={(event) => updateField("goals", event.target.value)}
              className="min-h-[80px] rounded-md border px-3 py-2"
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={formState.recommendRaise}
              onChange={(event) => updateField("recommendRaise", event.target.checked)}
            />
            Recommend raise or promotion
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
