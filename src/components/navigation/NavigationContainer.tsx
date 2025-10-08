/**
 * 🎯 NAVIGATION CONTAINER - Labs 2.0 Foundation
 * The core component that powers the entire navigation system
 * Built with Lovable's UX enhancements from day one!
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

// Navigation Types
interface NavigationConfig {
  groups: NavigationGroup[];
  theme: 'labs' | 'standard';
  responsive: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  accessibility: {
    landmarks: boolean;
    announcements: boolean;
    keyboardNav: boolean;
  };
}

interface NavigationGroup {
  id: string;
  title: string;
  icon?: React.ElementType;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  badge?: {
    text: string;
    variant: 'default' | 'beta' | 'new' | 'experimental';
    tooltip?: string;
  };
}

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: React.ElementType;
  description?: string;
  badge?: {
    text: string;
    variant: 'default' | 'beta' | 'new' | 'experimental';
    tooltip?: string;
  };
  isActive?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  tooltip?: string;
  children?: NavigationItem[];
}

interface NavigationContainerProps {
  config: NavigationConfig;
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
  onGroupToggle?: (groupId: string, expanded: boolean) => void;
  ariaLabel?: string;
}

// Main NavigationContainer Component
export const NavigationContainer = memo(({
  config,
  className,
  onItemClick,
  onGroupToggle,
  ariaLabel = "Main navigation"
}: NavigationContainerProps) => {
  const { theme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  // Initialize expanded groups on mount
  useEffect(() => {
    const defaultExpanded = new Set(
      config.groups
        .filter(group => group.defaultExpanded !== false)
        .map(group => group.id)
    );
    setExpandedGroups(defaultExpanded);
  }, [config.groups]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!config.accessibility.keyboardNav) return;

    setIsKeyboardUser(true);

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        // TODO: Implement keyboard navigation between items
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        // TODO: Activate focused item
        break;
      case 'Escape':
        setFocusedItem(null);
        break;
    }
  }, [config.accessibility.keyboardNav]);

  // Mouse interaction handler (disable keyboard user mode)
  const handleMouseInteraction = useCallback(() => {
    setIsKeyboardUser(false);
  }, []);

  // Group toggle handler
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }

      const group = config.groups.find(g => g.id === groupId);
      if (group && onGroupToggle) {
        onGroupToggle(groupId, newExpanded.has(groupId));
      }

      return newExpanded;
    });
  }, [config.groups, onGroupToggle]);

  // Theme-aware classes
  const containerClasses = cn(
    // Base styles
    'navigation-container',
    'flex flex-col h-full',
    'transition-theme',

    // Theme-specific styles
    config.theme === 'labs' ? [
      'bg-card-labs-glass',
      'border-labs',
      'shadow-card-labs'
    ] : [
      'bg-card',
      'border',
      'shadow-card'
    ],

    // Responsive behavior (mobile-first)
    'w-full', // Mobile: full width
    'md:w-64', // Tablet+: fixed width
    'lg:w-72', // Desktop: slightly wider

    // Accessibility
    config.accessibility.landmarks && 'navigation-landmark',

    className
  );

  return (
    <nav
      className={containerClasses}
      role={config.accessibility.landmarks ? 'navigation' : undefined}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseInteraction}
      onClick={handleMouseInteraction}
    >
      {/* Screen reader announcements */}
      {config.accessibility.announcements && (
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
          id="navigation-announcements"
        />
      )}

      {/* Navigation Header */}
      <div className="navigation-header p-4 border-b border-labs">
        <h2 className="text-lg font-semibold text-foreground-labs">
          {config.theme === 'labs' ? 'Labs 2.0 Navigation' : 'Navigation'}
        </h2>
      </div>

      {/* Navigation Groups */}
      <div className="navigation-groups flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {config.groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="navigation-group mb-2"
            >
              {/* Group Header */}
              <button
                onClick={() => group.collapsible && toggleGroup(group.id)}
                className={cn(
                  'navigation-group-header',
                  'w-full flex items-center justify-between',
                  'p-3 rounded-lg text-left',
                  'transition-theme hover-lift',
                  config.theme === 'labs' ? [
                    'text-muted-foreground-labs',
                    'hover:bg-accent hover:text-accent-foreground'
                  ] : [
                    'text-muted-foreground',
                    'hover:bg-accent hover:text-accent-foreground'
                  ],
                  !group.collapsible && 'cursor-default',
                  isKeyboardUser && focusedItem === group.id && 'ring-2 ring-primary'
                )}
                disabled={!group.collapsible}
                aria-expanded={group.collapsible ? expandedGroups.has(group.id) : undefined}
                aria-controls={group.collapsible ? `group-${group.id}` : undefined}
              >
                <div className="flex items-center gap-2">
                  {group.icon && (
                    <group.icon className="h-4 w-4" />
                  )}
                  <span className="font-medium">{group.title}</span>
                  {group.badge && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        group.badge.variant === 'beta' && 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
                        group.badge.variant === 'new' && 'bg-green-500/20 text-green-300 border border-green-500/30',
                        group.badge.variant === 'experimental' && 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      )}
                      title={group.badge.tooltip}
                    >
                      {group.badge.text}
                    </span>
                  )}
                </div>

                {group.collapsible && (
                  <motion.div
                    animate={{ rotate: expandedGroups.has(group.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                )}
              </button>

              {/* Group Items */}
              <AnimatePresence>
                {(!group.collapsible || expandedGroups.has(group.id)) && (
                  <motion.div
                    id={group.collapsible ? `group-${group.id}` : undefined}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="navigation-items ml-4 mt-1 space-y-1 overflow-hidden"
                  >
                    {group.items.map((item) => (
                      <div key={item.id} className="navigation-item-wrapper">
                        {/* NavigationItem will be implemented next */}
                        <div className="p-2 text-sm text-muted-foreground-labs">
                          {item.title} {item.isLoading && '⟳'}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="navigation-footer p-4 border-t border-labs">
        <div className="text-xs text-muted-foreground-labs text-center">
          {config.theme === 'labs' ? 'Labs 2.0 Enhanced' : 'Standard Navigation'}
        </div>
      </div>
    </nav>
  );
});

NavigationContainer.displayName = 'NavigationContainer';

export type { NavigationConfig, NavigationGroup, NavigationItem, NavigationContainerProps };