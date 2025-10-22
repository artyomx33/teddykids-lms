import { Badge } from "@/components/ui/badge";

export function ReviewChips({
  needsSix,
  needsYearly
}: { needsSix?: boolean | null; needsYearly?: boolean | null }) {
  if (!needsSix && !needsYearly) return null;

  return (
    <div className="flex gap-2">
      {needsSix && (
        <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
          6-mo review
        </Badge>
      )}
      {needsYearly && (
        <Badge variant="destructive">
          Yearly review
        </Badge>
      )}
    </div>
  );
}

export function StarBadge({ show }: { show?: boolean | null }) {
  if (!show) return null;

  return (
    <Badge variant="secondary" className="ml-2 gap-1">
      ⭐ Teddy Star
    </Badge>
  );
}
