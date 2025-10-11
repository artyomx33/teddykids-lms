import {
  Activity,
  FileText,
  GraduationCap,
  Home,
  Mail,
  RefreshCw,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { NavigationSection, NavItem } from '@/components/navigation/NavigationContainer';

export const navigationSections: NavigationSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/', icon: Home, description: 'Overview of current activity' },
      { id: 'staff', label: 'Staff', href: '/staff', icon: Users, description: 'Manage team members' },
      { id: 'contracts', label: 'Contracts', href: '/contracts', icon: FileText, description: 'Contract templates and status' },
      { id: 'reviews', label: 'Reviews', href: '/reviews', icon: Star, description: 'Performance reviews' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'reports', label: 'Reports', href: '/reports', icon: TrendingUp, description: 'Key metrics and exports' },
      { id: 'activity', label: 'Activity Feed', href: '/activity', icon: Activity, description: 'Recent changes across the LMS' },
      { id: 'email', label: 'Email', href: '/email', icon: Mail, description: 'Connected inbox' },
      { id: 'employes-sync', label: 'Employes Sync', href: '/employes-sync', icon: RefreshCw, description: 'Integrations status' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { id: 'interns', label: 'Interns', href: '/interns', icon: GraduationCap, description: 'Intern programme overview' },
      { id: 'compliance', label: 'Compliance', href: '/compliance', icon: Shield, description: 'Document and policy checks' },
      { id: 'settings', label: 'Settings', href: '/settings', icon: Settings, description: 'Account and system preferences' },
    ],
  },
];

export const mobileNavigationSections: NavigationSection[] = navigationSections;

export function findNavigationItem(pathname: string): NavItem | undefined {
  for (const section of navigationSections) {
    for (const item of section.items) {
      if (pathname === item.href) {
        return item;
      }
      if (item.href !== '/' && pathname.startsWith(item.href)) {
        return item;
      }
    }
  }
  return undefined;
}
