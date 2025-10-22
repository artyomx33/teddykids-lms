/**
 * DISC PREVIEW COMPONENT - LUNA ADDITION
 * 
 * Compact DISC profile display for candidate list rows
 * Shows: Color icon + Primary/Secondary text + Hover breakdown
 * 
 * Agent: Component Refactoring Architect + Design System Enforcer
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import type { DISCProfile, DISCColor } from '@/types/talentAcquisition';
import { DISC_COLOR_LABELS, DISC_COLOR_DESCRIPTIONS } from '@/types/talentAcquisition';

// =============================================================================
// DISC COLOR ICON COMPONENT
// =============================================================================

interface DISCColorIconProps {
  color: DISCColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DISCColorIcon: React.FC<DISCColorIconProps> = ({
  color,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  
  const colorClasses: Record<DISCColor, string> = {
    Red: 'bg-red-500',
    Blue: 'bg-blue-500',
    Green: 'bg-green-500',
    Yellow: 'bg-yellow-500',
  };
  
  return (
    <div
      className={cn(
        'rounded-full border-2 border-white shadow-sm',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      title={`${color} - ${DISC_COLOR_LABELS[color]}`}
    />
  );
};

// =============================================================================
// DISC COMPACT PREVIEW (for list rows)
// =============================================================================

interface DISCCompactPreviewProps {
  profile: DISCProfile;
  showPercentage?: boolean;
  className?: string;
}

export const DISCCompactPreview: React.FC<DISCCompactPreviewProps> = ({
  profile,
  showPercentage = true,
  className,
}) => {
  const primaryPercentage = (profile.color_distribution[profile.primary_color.toLowerCase() as Lowercase<DISCColor>] / 40) * 100;
  const secondaryPercentage = (profile.color_distribution[profile.secondary_color.toLowerCase() as Lowercase<DISCColor>] / 40) * 100;
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={cn('flex items-center gap-2 cursor-pointer', className)}>
          {/* Color Icons */}
          <div className="flex items-center -space-x-2">
            <DISCColorIcon color={profile.primary_color} size="md" />
            <DISCColorIcon color={profile.secondary_color} size="sm" />
          </div>
          
          {/* Primary/Secondary Text */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-foreground">
                {profile.primary_color}
              </span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs text-muted-foreground">
                {profile.secondary_color}
              </span>
            </div>
            
            {/* Mini progress bar */}
            {showPercentage && (
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${primaryPercentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {Math.round(primaryPercentage)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-80" side="right">
        <DISCHoverBreakdown profile={profile} />
      </HoverCardContent>
    </HoverCard>
  );
};

// =============================================================================
// DISC HOVER BREAKDOWN (detailed view)
// =============================================================================

interface DISCHoverBreakdownProps {
  profile: DISCProfile;
}

export const DISCHoverBreakdown: React.FC<DISCHoverBreakdownProps> = ({
  profile,
}) => {
  const colors: DISCColor[] = ['Red', 'Blue', 'Green', 'Yellow'];
  
  const getColorClass = (color: DISCColor) => {
    const classes: Record<DISCColor, string> = {
      Red: 'bg-red-500',
      Blue: 'bg-blue-500',
      Green: 'bg-green-500',
      Yellow: 'bg-yellow-500',
    };
    return classes[color];
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h4 className="font-semibold text-sm mb-1">DISC Profile Breakdown</h4>
        <p className="text-xs text-muted-foreground">
          Based on 40-question assessment
        </p>
      </div>
      
      {/* Primary Badge */}
      <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <DISCColorIcon color={profile.primary_color} size="md" />
        <div className="flex-1">
          <div className="text-sm font-medium">{profile.primary_color}</div>
          <div className="text-xs text-muted-foreground">
            {DISC_COLOR_LABELS[profile.primary_color]}
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          Primary
        </Badge>
      </div>
      
      {/* Score Breakdown */}
      <div className="space-y-2">
        {colors.map((color) => {
          const score = profile.color_distribution[color.toLowerCase() as Lowercase<DISCColor>];
          const percentage = (score / 40) * 100;
          const isPrimary = color === profile.primary_color;
          const isSecondary = color === profile.secondary_color;
          
          return (
            <div key={color} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <DISCColorIcon color={color} size="sm" />
                  <span className={cn(
                    'font-medium',
                    (isPrimary || isSecondary) && 'text-foreground',
                    !isPrimary && !isSecondary && 'text-muted-foreground'
                  )}>
                    {color}
                  </span>
                  {isSecondary && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      2nd
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground tabular-nums">
                  {score}/40 ({Math.round(percentage)}%)
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                indicatorClassName={getColorClass(color)}
              />
            </div>
          );
        })}
      </div>
      
      {/* Group Fit */}
      {profile.group_fit && (
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="text-xs font-medium mb-1">Recommended Group Fit</div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{profile.group_fit}</span>
            {profile.group_fit_confidence && (
              <Badge variant="outline" className="text-xs">
                {profile.group_fit_confidence}% confidence
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Red Flags */}
      {profile.redflag_count > 0 && (
        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="text-xs font-medium mb-1 text-red-600 dark:text-red-400">
            ⚠️ {profile.redflag_count} Red Flag{profile.redflag_count !== 1 ? 's' : ''} Detected
          </div>
          <div className="text-xs text-muted-foreground">
            Review assessment details for concerns
          </div>
        </div>
      )}
      
      {/* Key Traits */}
      {profile.personality_traits && profile.personality_traits.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium">Key Personality Traits</div>
          <div className="flex flex-wrap gap-1">
            {profile.personality_traits.slice(0, 5).map((trait, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {trait}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// DISC PROGRESS CIRCLE (for dashboard/profile)
// =============================================================================

interface DISCProgressCircleProps {
  profile: DISCProfile;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const DISCProgressCircle: React.FC<DISCProgressCircleProps> = ({
  profile,
  size = 120,
  strokeWidth = 8,
  className,
}) => {
  const colors: DISCColor[] = ['Red', 'Blue', 'Green', 'Yellow'];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const getColorStroke = (color: DISCColor) => {
    const strokes: Record<DISCColor, string> = {
      Red: '#ef4444',
      Blue: '#3b82f6',
      Green: '#22c55e',
      Yellow: '#eab308',
    };
    return strokes[color];
  };
  
  // Calculate segments
  let currentOffset = 0;
  const segments = colors.map((color) => {
    const score = profile.color_distribution[color.toLowerCase() as Lowercase<DISCColor>];
    const percentage = score / 40;
    const segmentLength = circumference * percentage;
    const offset = currentOffset;
    currentOffset += segmentLength;
    
    return {
      color,
      score,
      percentage,
      segmentLength,
      offset,
    };
  });
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
          opacity={0.1}
        />
        
        {segments.map((segment, index) => (
          <circle
            key={segment.color}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColorStroke(segment.color)}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segment.segmentLength} ${circumference}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="round"
          />
        ))}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1">
          <DISCColorIcon color={profile.primary_color} size="sm" />
          <span className="text-sm font-bold">
            {profile.primary_color}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {DISC_COLOR_LABELS[profile.primary_color]}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// PERSONALITY BADGE DISPLAY (Luna's Gamified Badges)
// =============================================================================

interface PersonalityBadgeProps {
  title: string;
  emoji: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export const PersonalityBadge: React.FC<PersonalityBadgeProps> = ({
  title,
  emoji,
  description,
  size = 'md',
  showDescription = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };
  
  const emojiSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };
  
  if (showDescription && description) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge
            className={cn(
              'font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-foreground cursor-pointer',
              sizeClasses[size],
              className
            )}
          >
            <span className={cn('mr-2', emojiSizeClasses[size])}>{emoji}</span>
            {title}
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <h4 className="font-semibold">{title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }
  
  return (
    <Badge
      className={cn(
        'font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-foreground',
        sizeClasses[size],
        className
      )}
    >
      <span className={cn('mr-2', emojiSizeClasses[size])}>{emoji}</span>
      {title}
    </Badge>
  );
};

// =============================================================================
// EXPORT ALL COMPONENTS
// =============================================================================

export default {
  ColorIcon: DISCColorIcon,
  CompactPreview: DISCCompactPreview,
  HoverBreakdown: DISCHoverBreakdown,
  ProgressCircle: DISCProgressCircle,
  PersonalityBadge: PersonalityBadge,
};

