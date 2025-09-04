// src/components/staff/ReviewDueBanner.tsx
import React from 'react';

export function ReviewDueBanner({
  nextReviewDue,
  needsSix,
  needsYearly,
  onCreateReview
}: {
  nextReviewDue?: string | null;
  needsSix?: boolean | null;
  needsYearly?: boolean | null;
  onCreateReview?: () => void;
}) {
  if (!needsSix && !needsYearly) return null;

  const label = needsSix ? '6-month review due' : 'Yearly review due';

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-amber-900">{label}</div>
          <div className="mt-1 text-sm text-amber-800">
            {nextReviewDue ? <>Next by <span className="font-medium">{nextReviewDue}</span></> : 'Schedule the review'}
          </div>
        </div>
        <button
          onClick={onCreateReview}
          className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
        >
          Create review
        </button>
      </div>
    </div>
  );
}
