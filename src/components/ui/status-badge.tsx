import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = "success" | "warning" | "error" | "info" | "pending";

const statusConfig = {
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  pending: "border-gray-200 bg-gray-50 text-gray-700",
} as const;

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

/**
 * StatusBadge - Consistent status indicator component
 * 
 * Uses semantic status types instead of hardcoded colors.
 * Part of the design system standardization.
 * 
 * @example
 * <StatusBadge status="success">Complete</StatusBadge>
 * <StatusBadge status="warning">Pending</StatusBadge>
 * <StatusBadge status="error">Failed</StatusBadge>
 */
export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusConfig[status], className)}>
      {children}
    </Badge>
  );
}

