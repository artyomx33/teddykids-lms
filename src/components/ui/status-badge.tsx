import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = "success" | "warning" | "error" | "info" | "pending";

const statusConfig = {
  success: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  error: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  pending: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
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
    <Badge variant="outline" className={cn(statusConfig[status], "inline-flex items-center", className)}>
      {children}
    </Badge>
  );
}

