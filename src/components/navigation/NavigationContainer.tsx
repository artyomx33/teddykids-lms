import type { ElementType } from 'react';
import { NavigationItem } from './NavigationItem';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ElementType;
  badge?: string;
  description?: string;
}

export interface NavigationSection {
  id: string;
  label?: string;
  items: NavItem[];
}

interface NavigationContainerProps {
  sections: NavigationSection[];
  className?: string;
  onItemClick?: () => void;
}

export function NavigationContainer({ sections, className, onItemClick }: NavigationContainerProps) {
  return (
    <nav
      className={cn('flex h-full flex-col gap-6 overflow-y-auto p-4', className)}
      aria-label="Main navigation"
    >
      {sections.map((section) => (
        <div key={section.id} className="space-y-2">
          {section.label && (
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.label}
            </p>
          )}
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.id}>
                <NavigationItem item={item} onNavigate={onItemClick} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
