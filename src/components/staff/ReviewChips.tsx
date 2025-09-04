// src/components/staff/ReviewChips.tsx
import React from 'react';

export function ReviewChips({
  needsSix,
  needsYearly
}: { needsSix?: boolean | null; needsYearly?: boolean | null }) {
  if (!needsSix && !needsYearly) return null;

  return (
    <div className="flex gap-2">
      {needsSix ? (
        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-medium">
          6-mo review
        </span>
      ) : null}
      {needsYearly ? (
        <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-xs font-medium">
          Yearly review
        </span>
      ) : null}
    </div>
  );
}

export function StarBadge({ show }: { show?: boolean | null }) {
  if (!show) return null;

  return (
    <span className="ml-2 inline-flex items-center rounded-md border border-yellow-300 bg-yellow-50 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide">
      ⭐ Teddy Star
    </span>
  );
}
