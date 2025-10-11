/**
 * 🎯 NAVIGATION ITEM - Enhanced UX Component
 * Implements Lovable's suggestions for tooltips, loading states, and accessibility
 */

import React, { memo, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Import types from NavigationContainer
import type { NavigationItem as NavigationItemType } from './NavigationContainer';

interface NavigationItemProps {
  item: NavigationItemType;
  theme?: 'labs' | 'standard';
  onClick?: (item: NavigationItemType) => void;
  onKeyDown?: (event: React.KeyboardEvent, item: NavigationItemType) => void;
  className?: string;
  isFocused?: boolean;
  level?: number; // For nested items
}

// Badge component for status indicators
const StatusBadge = memo(({
  badge,
  theme = 'standard'
}: {
  badge: NavigationItemType['badge'];
  theme?: 'labs' | 'standard';
}) => {
  if (!badge) return null;

  const badgeClasses = cn(
    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
    'transition-all duration-200',
    {
      'bg-blue-500/20 text-blue-300 border border-blue-500/30': badge.variant === 'beta',
      'bg-green-500/20 text-green-300 border border-green-500/30': badge.variant === 'new',
      'bg-orange-500/20 text-orange-300 border border-orange-500/30': badge.variant === 'experimental',
      'bg-muted/50 text-muted-foreground border border-border': badge.variant === 'default',
    }
  );

  const BadgeContent = (
    <span className={badgeClasses}>
      {badge.text}
    </span>
  );

  // Wrap with tooltip if tooltip text is provided
  if (badge.tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {BadgeContent}
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className={cn(
              'max-w-xs p-3',
              theme === 'labs' ? 'bg-card-labs-glass border-labs' : 'bg-popover'
            )}
          >
            <div className="space-y-1">
              <div className="font-medium">{badge.text} Status</div>
              <div className="text-sm text-muted-foreground">
                {badge.tooltip}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return BadgeContent;
});

StatusBadge.displayName = 'StatusBadge';

// Loading indicator component
const LoadingIndicator = memo(() => (
  <div className="flex items-center justify-center">
    <Loader2 className="h-3 w-3 animate-spin text-primary" />
  </div>
));

LoadingIndicator.displayName = 'LoadingIndicator';

// Main NavigationItem component
export const NavigationItem = memo(({
  item,
  theme = 'standard',
  onClick,
  onKeyDown,
  className,
  isFocused = false,
  level = 0
}: NavigationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Handle click events
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (item.disabled || item.isLoading) {
      event.preventDefault();
      return;
    }

    if (onClick) {
      onClick(item);
    }
  }, [item, onClick]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(event, item);
    }
  }, [item, onKeyDown]);

  // Base styles for the item
  const itemClasses = cn(
    // Base layout and spacing
    'group relative flex items-center w-full p-3 rounded-lg',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus-visible:outline-none',

    // Theme-specific colors
    theme === 'labs' ? [
      'text-muted-foreground-labs',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:bg-accent focus-visible:text-accent-foreground',
    ] : [
      'text-muted-foreground',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:bg-accent focus-visible:text-accent-foreground',
    ],

    // Active state (handled by NavLink)
    'aria-current-page:bg-primary aria-current-page:text-primary-foreground',
    'aria-current-page:shadow-glow',

    // Interactive states
    !item.disabled && !item.isLoading && [
      'hover:shadow-soft hover:scale-[1.02]',
      'active:scale-[0.98]',
      'cursor-pointer'
    ],

    // Disabled state
    item.disabled && [
      'opacity-50 cursor-not-allowed',
      'hover:bg-transparent hover:text-current hover:shadow-none hover:scale-100'
    ],

    // Loading state
    item.isLoading && [
      'cursor-wait opacity-75'
    ],

    // Focus state (for keyboard navigation)
    isFocused && [
      'ring-2 ring-primary ring-offset-2 ring-offset-background'
    ],

    // Nested level indentation
    level > 0 && `ml-${level * 4}`,

    className
  );

  // Content for the navigation item
  const ItemContent = (
    <div className="flex items-center w-full min-w-0">
      {/* Icon */}
      {item.icon && (
        <div className="flex-shrink-0 mr-3">
          <motion.div
            whileHover={!item.disabled && !item.isLoading ? { scale: 1.1 } : {}}
            whileTap={!item.disabled && !item.isLoading ? { scale: 0.95 } : {}}
            transition={{ duration: 0.15 }}
          >
            <item.icon
              className={cn(
                'h-5 w-5',
                item.isActive && 'text-primary',
                item.disabled && 'opacity-50'
              )}
            />
          </motion.div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          {/* Title and description */}
          <div className="min-w-0 flex-1">
            <div className={cn(
              'font-medium truncate',
              item.isActive && 'text-primary'
            )}>
              {item.title}
            </div>
            {item.description && (
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {item.description}
              </div>
            )}
          </div>

          {/* Right side indicators */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Loading indicator */}
            {item.isLoading && <LoadingIndicator />}

            {/* Status badge */}
            {item.badge && <StatusBadge badge={item.badge} theme={theme} />}

            {/* Error indicator */}
            {item.disabled && (
              <AlertCircle className="h-4 w-4 text-destructive opacity-70" />
            )}

            {/* Chevron for items with children */}
            {item.children && item.children.length > 0 && (
              <ChevronRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Wrap content with tooltip if provided
  const ItemWithTooltip = item.tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            {ItemContent}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className={cn(
            'max-w-sm p-3',
            theme === 'labs' ? 'bg-card-labs-glass border-labs' : 'bg-popover'
          )}
        >
          <div className="space-y-2">
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-muted-foreground">
              {item.tooltip}
            </div>
            {item.description && (
              <div className="text-xs text-muted-foreground/80 pt-1 border-t">
                {item.description}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : ItemContent;

  // If the item is disabled or loading, render as a div
  if (item.disabled || item.isLoading) {
    return (
      <div
        className={itemClasses}
        role="menuitem"
        aria-disabled={item.disabled}
        aria-busy={item.isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        tabIndex={isFocused ? 0 : -1}
      >
        {ItemWithTooltip}
      </div>
    );
  }

  // For regular items, use NavLink for routing
  return (
    <NavLink
      to={item.href}
      className={({ isActive, isPending }) => cn(
        itemClasses,
        isActive && 'bg-primary text-primary-foreground shadow-glow',
        isPending && 'opacity-75'
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={isFocused ? 0 : -1}
      aria-current={item.isActive ? 'page' : undefined}
      aria-describedby={item.description ? `${item.id}-description` : undefined}
    >
      {/* Hidden description for screen readers */}
      {item.description && (
        <span id={`${item.id}-description`} className="sr-only">
          {item.description}
        </span>
      )}

      {ItemWithTooltip}
    </NavLink>
  );
});

NavigationItem.displayName = 'NavigationItem';

export type { NavigationItemProps };