/**
 * CANDIDATE STATUS BADGE - LUNA-APPROVED
 * 
 * Displays candidate status with color-coded badges and emojis
 * Matches Luna's specifications exactly
 * 
 * Agent: Design System Enforcer + Component Refactoring Architect
 */

import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_CONFIG, type CandidateStatus, type CandidateDecision } from '@/types/talentAcquisition';
import { cn } from '@/lib/utils';

// =============================================================================
// STATUS BADGE COMPONENT
// =============================================================================

interface CandidateStatusBadgeProps {
  status: CandidateStatus;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const CandidateStatusBadge: React.FC<CandidateStatusBadgeProps> = ({
  status,
  size = 'md',
  showEmoji = true,
  showLabel = true,
  className,
}) => {
  const config = STATUS_BADGE_CONFIG[status];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    blue: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600',
    purple: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600',
    green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600',
    gold: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600',
  };
  
  return (
    <Badge
      className={cn(
        'font-medium border',
        sizeClasses[size],
        colorClasses[config.color],
        className
      )}
    >
      {showEmoji && <span className="mr-1.5">{config.emoji}</span>}
      {showLabel && config.label}
    </Badge>
  );
};

// =============================================================================
// DECISION BADGE COMPONENT
// =============================================================================

interface CandidateDecisionBadgeProps {
  decision: CandidateDecision;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CandidateDecisionBadge: React.FC<CandidateDecisionBadgeProps> = ({
  decision,
  size = 'md',
  className,
}) => {
  const decisionConfig: Record<CandidateDecision, { color: string; emoji: string; label: string }> = {
    pending: {
      color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300',
      emoji: '⏳',
      label: 'Pending Decision',
    },
    hired: {
      color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      emoji: '✅',
      label: 'Hired',
    },
    on_hold: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
      emoji: '⏸️',
      label: 'On Hold',
    },
    not_hired: {
      color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      emoji: '❌',
      label: 'Not Hired',
    },
    withdrawn: {
      color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
      emoji: '🚪',
      label: 'Withdrawn',
    },
  };
  
  const config = decisionConfig[decision];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  return (
    <Badge
      className={cn(
        'font-medium border',
        sizeClasses[size],
        config.color,
        className
      )}
    >
      <span className="mr-1.5">{config.emoji}</span>
      {config.label}
    </Badge>
  );
};

// =============================================================================
// REDFLAG BADGE COMPONENT
// =============================================================================

interface RedFlagBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const RedFlagBadge: React.FC<RedFlagBadgeProps> = ({
  count,
  size = 'md',
  showCount = true,
  className,
}) => {
  if (count === 0) return null;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  const severity = count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low';
  
  const severityClasses = {
    high: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600 animate-pulse',
    medium: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600',
    low: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600',
  };
  
  return (
    <Badge
      className={cn(
        'font-medium border',
        sizeClasses[size],
        severityClasses[severity],
        className
      )}
    >
      <span className="mr-1.5">🚩</span>
      {showCount && `${count} Red Flag${count !== 1 ? 's' : ''}`}
      {!showCount && 'Red Flag'}
    </Badge>
  );
};

// =============================================================================
// DISC BADGE COMPONENT
// =============================================================================

import type { DISCColor } from '@/types/talentAcquisition';

interface DISCBadgeProps {
  primaryColor: DISCColor;
  secondaryColor?: DISCColor;
  size?: 'sm' | 'md' | 'lg';
  showBoth?: boolean;
  className?: string;
}

export const DISCBadge: React.FC<DISCBadgeProps> = ({
  primaryColor,
  secondaryColor,
  size = 'md',
  showBoth = true,
  className,
}) => {
  const discColorClasses: Record<DISCColor, string> = {
    Red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600',
    Blue: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600',
    Green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600',
    Yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  return (
    <div className={cn('flex gap-1', className)}>
      <Badge
        className={cn(
          'font-medium border',
          sizeClasses[size],
          discColorClasses[primaryColor]
        )}
      >
        {primaryColor}
      </Badge>
      
      {showBoth && secondaryColor && (
        <>
          <span className="text-muted-foreground">/</span>
          <Badge
            className={cn(
              'font-medium border',
              sizeClasses[size],
              discColorClasses[secondaryColor]
            )}
          >
            {secondaryColor}
          </Badge>
        </>
      )}
    </div>
  );
};

// =============================================================================
// GROUP FIT BADGE COMPONENT
// =============================================================================

import type { GroupFitCategory } from '@/types/talentAcquisition';

interface GroupFitBadgeProps {
  groupFit: GroupFitCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GroupFitBadge: React.FC<GroupFitBadgeProps> = ({
  groupFit,
  size = 'md',
  className,
}) => {
  const groupFitConfig: Record<GroupFitCategory, { emoji: string; color: string }> = {
    'Babies (0-1)': {
      emoji: '👶',
      color: 'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300',
    },
    '1-2 years': {
      emoji: '🧒',
      color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
    },
    '3+ years': {
      emoji: '👦',
      color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    },
    'Multi-age': {
      emoji: '👨‍👩‍👧‍👦',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300',
    },
    'Administrative': {
      emoji: '💼',
      color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300',
    },
  };
  
  const config = groupFitConfig[groupFit];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  return (
    <Badge
      className={cn(
        'font-medium border',
        sizeClasses[size],
        config.color,
        className
      )}
    >
      <span className="mr-1.5">{config.emoji}</span>
      {groupFit}
    </Badge>
  );
};

// =============================================================================
// COMBINED STATUS BAR COMPONENT
// =============================================================================

interface CandidateStatusBarProps {
  status: CandidateStatus;
  decision?: CandidateDecision;
  redflagCount?: number;
  primaryDiscColor?: DISCColor;
  secondaryDiscColor?: DISCColor;
  groupFit?: GroupFitCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CandidateStatusBar: React.FC<CandidateStatusBarProps> = ({
  status,
  decision,
  redflagCount = 0,
  primaryDiscColor,
  secondaryDiscColor,
  groupFit,
  size = 'md',
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Status Badge */}
      <CandidateStatusBadge status={status} size={size} />
      
      {/* Decision Badge (if not pending) */}
      {decision && decision !== 'pending' && (
        <CandidateDecisionBadge decision={decision} size={size} />
      )}
      
      {/* Red Flag Badge (if any) */}
      {redflagCount > 0 && (
        <RedFlagBadge count={redflagCount} size={size} />
      )}
      
      {/* DISC Badge */}
      {primaryDiscColor && (
        <DISCBadge
          primaryColor={primaryDiscColor}
          secondaryColor={secondaryDiscColor}
          size={size}
        />
      )}
      
      {/* Group Fit Badge */}
      {groupFit && (
        <GroupFitBadge groupFit={groupFit} size={size} />
      )}
    </div>
  );
};

// =============================================================================
// DEFAULT EXPORT (all components)
// =============================================================================

export default {
  Status: CandidateStatusBadge,
  Decision: CandidateDecisionBadge,
  RedFlag: RedFlagBadge,
  DISC: DISCBadge,
  GroupFit: GroupFitBadge,
  StatusBar: CandidateStatusBar,
};

