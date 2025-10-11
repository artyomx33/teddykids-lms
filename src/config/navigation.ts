/**
 * 🎯 NAVIGATION CONFIGURATION - Single Source of Truth
 * This is THE file that controls the entire navigation system!
 * Change one line here to adjust the whole menu ✨
 */

import {
  Home,
  Users,
  FileText,
  TrendingUp,
  Settings,
  Dna,
  Atom,
  Heart,
  Gamepad2,
  Zap,
  Brain,
  UserPlus,
  Clock,
  Star,
  Calendar,
  FileCheck,
  Building,
  MapPin,
  BarChart3,
  Shield,
  FlaskConical,
  Sparkles,
  Rocket,
  GraduationCap,
  Activity,
  Mail,
  RefreshCw,
  BookOpen
} from 'lucide-react';

import type { NavigationConfig, NavigationGroup, NavigationItem } from '@/components/navigation/NavigationContainer';

/**
 * 🔧 GLOBAL NAVIGATION THEME SETTING
 * Change this ONE line to transform the entire navigation system!
 */
const NAVIGATION_THEME: 'labs' | 'standard' = 'labs'; // 🎯 THE MAGIC LINE! ✨

/**
 * 🎨 ENHANCED MENU CONFIGURATION
 * Consolidating 23 items → 18 items across 6 groups
 * Built with Lovable's UX enhancements from day one!
 */
export const navigationConfig: NavigationConfig = {
  theme: NAVIGATION_THEME,
  responsive: {
    mobile: true,
    tablet: true,
    desktop: true,
  },
  accessibility: {
    landmarks: true,
    announcements: true,
    keyboardNav: true,
  },
  groups: [
    // 🏠 Core Operations (4 items)
    {
      id: 'core',
      title: 'Core Operations',
      icon: Home,
      defaultExpanded: true,
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard 2.0',
          href: '/',
          icon: Home,
          description: 'Intelligent admin portal with Labs enhancements',
          tooltip: 'Your command center for all TeddyKids operations. Features AI-powered insights and real-time analytics.',
          badge: {
            text: 'Enhanced',
            variant: 'new',
            tooltip: 'Recently upgraded with Labs 2.0 features including dark mode and enhanced UX'
          }
        },
        {
          id: 'staff-unified',
          title: 'Staff Management',
          href: '/staff',
          icon: Users,
          description: 'Unified staff oversight and management',
          tooltip: 'Complete staff management system with profiles, performance tracking, and administrative tools.',
          badge: {
            text: 'Unified',
            variant: 'beta',
            tooltip: 'Merged Staff and Staff 2.0 into a single, powerful interface'
          }
        },
        {
          id: 'contracts-unified',
          title: 'Contract Systems',
          href: '/contracts',
          icon: FileText,
          description: 'Enhanced contract management with DNA analysis',
          tooltip: 'Advanced contract management featuring pattern recognition and compatibility analysis.',
          badge: {
            text: 'DNA+',
            variant: 'beta',
            tooltip: 'Includes Contract DNA features for genetic analysis of employment patterns'
          }
        },
        {
          id: 'interns',
          title: 'Interns',
          href: '/interns',
          icon: GraduationCap,
          description: 'Intern management',
          tooltip: 'Manage intern programs and progress tracking.'
        },
        {
          id: 'reports',
          title: 'Analytics & Reports',
          href: '/reports',
          icon: TrendingUp,
          description: 'Comprehensive business intelligence',
          tooltip: 'Advanced reporting with predictive analytics and customizable dashboards.'
        },
        {
          id: 'activity-feed',
          title: 'Activity Feed',
          href: '/activity',
          icon: Activity,
          description: 'System activity tracking',
          tooltip: 'Monitor system activities and updates.'
        },
        {
          id: 'email',
          title: 'Email',
          href: '/email',
          icon: Mail,
          description: 'Email management',
          tooltip: 'Integrated email system.'
        },
        {
          id: 'employes-sync',
          title: 'Employes Sync',
          href: '/employes-sync',
          icon: RefreshCw,
          description: 'External system sync',
          tooltip: 'Sync with external HR systems.'
        },
        {
          id: 'compliance',
          title: 'Compliance',
          href: '/compliance',
          icon: Shield,
          description: 'Compliance tracking',
          tooltip: 'Monitor regulatory compliance.'
        },
        {
          id: 'insights',
          title: 'Insights',
          href: '/insights',
          icon: Brain,
          description: 'AI insights',
          tooltip: 'AI-powered business insights.'
        },
        {
          id: 'knowledge-center',
          title: 'Knowledge Center',
          href: '/grow/knowledge',
          icon: BookOpen,
          description: 'Learning resources',
          tooltip: 'Access training materials and documentation.'
        },
        {
          id: 'onboarding',
          title: 'Onboarding',
          href: '/grow/onboarding',
          icon: GraduationCap,
          description: 'Employee onboarding',
          tooltip: 'New employee onboarding process.'
        },
        {
          id: 'settings',
          title: 'Settings',
          href: '/settings',
          icon: Settings,
          description: 'System configuration',
          tooltip: 'Configure system settings and preferences.'
        }
      ]
    },

    // 🧪 Labs 2.0 Features (4 items)
    {
      id: 'labs',
      title: 'Labs 2.0',
      icon: FlaskConical,
      defaultExpanded: true,
      badge: {
        text: 'Experimental',
        variant: 'experimental',
        tooltip: 'Cutting-edge AI-powered features that push the boundaries of HR technology'
      },
      items: [
        {
          id: 'labs-overview',
          title: 'Labs Overview',
          href: '/labs',
          icon: Sparkles,
          description: 'Command center for experimental features',
          tooltip: 'Explore all Labs 2.0 experimental features in one place. Your gateway to the future of HR.',
          badge: {
            text: 'Portal',
            variant: 'new',
            tooltip: 'Recently redesigned with enhanced UX and feature discovery'
          }
        },
        {
          id: 'talent-acquisition',
          title: 'Talent Acquisition',
          href: '/labs/talent',
          icon: UserPlus,
          description: 'AI-powered hiring pipeline',
          tooltip: 'Smart candidate matching with automated assessments and pipeline analytics.',
          badge: {
            text: 'AI',
            variant: 'beta',
            tooltip: 'Powered by machine learning algorithms for optimal candidate matching'
          }
        },
        {
          id: 'quantum-dashboard',
          title: 'Quantum Dashboard',
          href: '/labs/quantum',
          icon: Atom,
          description: 'Future predictions and probability states',
          tooltip: 'Advanced analytics using quantum-inspired algorithms for scenario modeling.',
          badge: {
            text: 'Quantum',
            variant: 'experimental',
            tooltip: 'Experimental quantum-inspired probability calculations'
          }
        },
        {
          id: 'emotion-engine',
          title: 'Emotion Engine',
          href: '/labs/emotions',
          icon: Heart,
          description: 'AI emotional intelligence tracking',
          tooltip: 'Monitor team sentiment and emotional well-being with AI-powered analysis.',
          badge: {
            text: 'Experimental',
            variant: 'experimental',
            tooltip: 'Early-stage emotional intelligence features'
          }
        },
        {
          id: 'gamification',
          title: 'Gamification',
          href: '/labs/game',
          icon: Gamepad2,
          description: 'RPG employee system',
          tooltip: 'Transform work into an engaging RPG experience with levels, achievements, and rewards.',
          badge: {
            text: 'RPG',
            variant: 'experimental',
            tooltip: 'Turn your workplace into an RPG adventure'
          }
        },
        {
          id: 'time-travel',
          title: 'Time Travel',
          href: '/labs/time',
          icon: Clock,
          description: 'Timeline simulation',
          tooltip: 'Simulate different timeline scenarios and predict future outcomes.',
          badge: {
            text: 'Temporal',
            variant: 'experimental',
            tooltip: 'Experimental timeline manipulation features'
          }
        },
        {
          id: 'team-mood',
          title: 'Team Mood',
          href: '/labs/mood',
          icon: Heart,
          description: 'Emotional health & burnout tracking',
          tooltip: 'Monitor team emotional health and prevent burnout with AI insights.',
          badge: {
            text: 'Wellness',
            variant: 'beta',
            tooltip: 'Team wellness and burnout prevention tools'
          }
        }
      ]
    },

    // ⏰ Time & Performance (3 items)
    {
      id: 'time-performance',
      title: 'Time & Performance',
      icon: Clock,
      defaultExpanded: false,
      items: [
        {
          id: 'performance-reviews',
          title: 'Performance Reviews',
          href: '/reviews',
          icon: Star,
          description: 'Employee evaluation and feedback',
          tooltip: 'Comprehensive performance review system with 360-degree feedback and goal tracking.'
        },
        {
          id: 'calendar',
          title: 'Calendar & Scheduling',
          href: '/calendar',
          icon: Calendar,
          description: 'Team scheduling and time management',
          tooltip: 'Integrated calendar system for managing team schedules, meetings, and time off.'
        },
        {
          id: 'timesheets',
          title: 'Timesheet Management',
          href: '/timesheets',
          icon: Clock,
          description: 'Time tracking and payroll integration',
          tooltip: 'Track work hours, manage timesheets, and integrate with payroll systems.'
        }
      ]
    },

    // 📋 Operations (3 items)
    {
      id: 'operations',
      title: 'Operations',
      icon: FileCheck,
      defaultExpanded: false,
      items: [
        {
          id: 'invoices',
          title: 'Invoice Management',
          href: '/invoices',
          icon: FileCheck,
          description: 'Billing and financial tracking',
          tooltip: 'Manage invoices, track payments, and monitor financial performance.'
        },
        {
          id: 'companies',
          title: 'Company Directory',
          href: '/companies',
          icon: Building,
          description: 'Client and partner management',
          tooltip: 'Maintain relationships with client companies and business partners.'
        },
        {
          id: 'locations',
          title: 'Location Management',
          href: '/locations',
          icon: MapPin,
          description: 'Office and site coordination',
          tooltip: 'Manage office locations, remote sites, and workplace coordination.'
        }
      ]
    },

    // 📊 Intelligence (2 items)
    {
      id: 'intelligence',
      title: 'Business Intelligence',
      icon: BarChart3,
      defaultExpanded: false,
      items: [
        {
          id: 'kpi-dashboard',
          title: 'KPI Dashboard',
          href: '/kpi',
          icon: TrendingUp,
          description: 'Key performance indicators',
          tooltip: 'Monitor critical business metrics and performance indicators in real-time.'
        },
        {
          id: 'advanced-analytics',
          title: 'Advanced Analytics',
          href: '/analytics',
          icon: BarChart3,
          description: 'Deep business insights',
          tooltip: 'Comprehensive analytics with predictive modeling and trend analysis.'
        }
      ]
    },

    // ⚙️ System (2 items)
    {
      id: 'system',
      title: 'System',
      icon: Settings,
      defaultExpanded: false,
      items: [
        {
          id: 'settings',
          title: 'System Settings',
          href: '/settings',
          icon: Settings,
          description: 'Configuration and preferences',
          tooltip: 'Configure system settings, user preferences, and administrative options.'
        },
        {
          id: 'security',
          title: 'Security & Access',
          href: '/security',
          icon: Shield,
          description: 'User permissions and security',
          tooltip: 'Manage user access, security settings, and permission levels.',
          badge: {
            text: 'Admin',
            variant: 'default',
            tooltip: 'Administrative access required'
          }
        }
      ]
    }
  ]
};

/**
 * 🚀 QUICK THEME SWITCHER FUNCTIONS
 * Use these to instantly transform the entire navigation!
 */
export const switchToLabsTheme = (): NavigationConfig => ({
  ...navigationConfig,
  theme: 'labs'
});

export const switchToStandardTheme = (): NavigationConfig => ({
  ...navigationConfig,
  theme: 'standard'
});

/**
 * 🎯 MOBILE-OPTIMIZED CONFIGURATION
 * Automatically used on mobile devices for better UX
 */
export const mobileNavigationConfig: NavigationConfig = {
  ...navigationConfig,
  groups: navigationConfig.groups.map(group => ({
    ...group,
    // Collapse all groups by default on mobile
    defaultExpanded: group.id === 'core', // Only core stays expanded
    // Simplify items for mobile
    items: group.items.map(item => ({
      ...item,
      description: undefined, // Hide descriptions on mobile
      tooltip: item.tooltip // Keep tooltips for accessibility
    }))
  }))
};

/**
 * 🔍 UTILITY FUNCTIONS
 */
export const findNavigationItem = (itemId: string): NavigationItem | undefined => {
  for (const group of navigationConfig.groups) {
    const item = group.items.find(item => item.id === itemId);
    if (item) return item;
  }
  return undefined;
};

export const getNavigationGroup = (groupId: string): NavigationGroup | undefined => {
  return navigationConfig.groups.find(group => group.id === groupId);
};

/**
 * 🎨 THEME DETECTION
 */
export const getCurrentTheme = () => navigationConfig.theme;

export const isLabsTheme = () => navigationConfig.theme === 'labs';