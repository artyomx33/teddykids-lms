import { useMemo } from 'react';
import {
  FileText,
  Star,
  Upload,
  UserPlus,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity
} from "lucide-react";
import type { ActivityData } from './useActivityData';

// Enhanced ActivityItem interface with proper typing
export interface ActivityItem {
  id: string;
  type: 'contract' | 'review' | 'document' | 'hire' | 'certificate' | 'birthday';
  action: string;
  employee: string;
  manager?: string;
  time: string;
  timestamp: Date; // ✅ Added for proper sorting
  status: 'completed' | 'pending' | 'urgent';
  icon: React.ComponentType<{ className?: string }>; // ✅ More specific typing
  color: string;
  details?: string;
}

export function useActivityItems(activityData: ActivityData | undefined): ActivityItem[] {
  return useMemo(() => {
    if (!activityData) return [];

    const { contracts, reviews, documents, staff } = activityData;
    const items: ActivityItem[] = [];

    // Create staff lookup map for efficient staff name resolution
    const staffMap = new Map(staff.map(s => [s.id, s.full_name]));

    // Process contract activities
    contracts.forEach(contract => {
      const timestamp = new Date(contract.signed_at || contract.created_at);
      items.push({
        id: `contract-${contract.id}`,
        type: 'contract',
        action: contract.signed_at ? "Contract signed" : "Contract generated",
        employee: contract.employee_name,
        manager: contract.manager || undefined,
        time: getTimeAgo(timestamp),
        timestamp, // ✅ Store actual Date object for sorting
        status: contract.signed_at ? 'completed' : 'pending',
        icon: FileText,
        color: contract.signed_at ? 'text-success' : 'text-warning',
        details: contract.status
      });
    });

    // Process review activities
    reviews.forEach(review => {
      const timestamp = new Date(review.review_date);
      const staffName = staffMap.get(review.staff_id) || "Unknown Staff";
      items.push({
        id: `review-${review.id}`,
        type: 'review',
        action: review.score === 5 ? "🌟 5-star review completed" : "Review completed",
        employee: staffName,
        time: getTimeAgo(timestamp),
        timestamp,
        status: review.score >= 4 ? 'completed' : 'pending',
        icon: Star,
        color: review.score === 5 ? 'text-yellow-500' : 'text-primary',
        details: `${review.score}/5 ${review.review_type || 'review'}`
      });
    });

    // Process document activities
    documents.forEach(doc => {
      const timestamp = new Date(doc.uploaded_at);
      const staffName = staffMap.get(doc.staff_id) || "Unknown Staff";
      items.push({
        id: `doc-${doc.id}`,
        type: 'document',
        action: "Document uploaded",
        employee: staffName,
        time: getTimeAgo(timestamp),
        timestamp,
        status: 'completed',
        icon: Upload,
        color: 'text-blue-500',
        details: doc.certificate_type || 'Certificate'
      });
    });

    // Sort by actual timestamps (most recent first)
    const sortedItems = items.sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    );

    // Return top 8 most recent activities
    return sortedItems.slice(0, 8);
  }, [activityData]);
}

// Improved time ago function with proper error handling
function getTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "unknown";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Validate the date
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
      return "invalid date";
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();

    // Handle future dates
    if (diffMs < 0) {
      return "in the future";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;

    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

  } catch (error) {
    console.error('Error calculating time ago:', error, 'for date:', date);
    return "unknown";
  }
}

// Helper function to get initials from name
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return '??';

  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2); // Max 2 characters
}