import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { NavItem } from './NavigationContainer';

interface NavigationItemProps {
  item: NavItem;
  onNavigate?: () => void;
}

export function NavigationItem({ item, onNavigate }: NavigationItemProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )
      }
      onClick={onNavigate}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}
