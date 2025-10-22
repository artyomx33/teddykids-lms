import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type InteractiveProps = {
  interactive: true;
  onRatingChange: (rating: number) => void;
};

type DisplayProps = {
  interactive?: false;
  onRatingChange?: never;
};

type BaseStarRatingProps = {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
};

type StarRatingProps = BaseStarRatingProps & (InteractiveProps | DisplayProps);

const sizeConfig = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/**
 * StarRating - Consistent star rating display component
 * 
 * Replaces duplicated star rating logic across the app.
 * Uses semantic colors (primary instead of yellow-500).
 * 
 * @example
 * // Display only
 * <StarRating rating={4.5} />
 * 
 * // With value display
 * <StarRating rating={4.5} showValue />
 * 
 * // Interactive
 * <StarRating rating={rating} interactive onRatingChange={setRating} />
 */
export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  className,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStarClick(starIndex);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeConfig[size],
            i < rating ? "fill-primary text-primary" : "text-muted-foreground",
            interactive && "cursor-pointer transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm"
          )}
          onClick={() => handleStarClick(i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          tabIndex={interactive ? 0 : undefined}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? `Rate ${i + 1} star${i === 0 ? '' : 's'}` : undefined}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium">
          {Number.isInteger(rating) ? rating : rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

