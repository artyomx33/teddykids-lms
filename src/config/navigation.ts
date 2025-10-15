import type { ComponentType } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Mail,
  RefreshCw,
  Settings,
  ShieldCheck,
  Star,
  Users,
  Brain,
  Atom,
  Clock,
  Dna,
  Gamepad2,
  Heart,
  UserPlus
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Staff", to: "/staff", icon: Users },
  { label: "Interns", to: "/interns", icon: GraduationCap },
  { label: "Reviews", to: "/reviews", icon: Star },
  { label: "Contracts", to: "/contracts", icon: FileText },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Activity", to: "/activity", icon: Activity },
  { label: "Email", to: "/email", icon: Mail },
  { label: "Employes Sync", to: "/employes-sync", icon: RefreshCw },
  { label: "Compliance", to: "/compliance", icon: ShieldCheck },
  { label: "Insights", to: "/insights", icon: Brain },
  { label: "Knowledge Center", to: "/grow/knowledge", icon: BookOpen },
  { label: "Onboarding", to: "/grow/onboarding", icon: GraduationCap },
  { label: "Settings", to: "/settings", icon: Settings }
];

export const LABS_NAVIGATION: NavItem[] = [
  { label: "Contract DNA", to: "/labs/dna", icon: Dna },
  { label: "Quantum Dashboard", to: "/labs/quantum", icon: Atom },
  { label: "Emotion Engine", to: "/labs/emotions", icon: Heart },
  { label: "Gamification", to: "/labs/game", icon: Gamepad2 },
  { label: "Time Travel", to: "/labs/time", icon: Clock },
  { label: "Team Mood", to: "/labs/mood", icon: Brain },
  { label: "Talent Acquisition", to: "/labs/talent", icon: UserPlus }
];

export const NAVIGATION_SECTIONS: NavSection[] = [
  { label: "Main", items: MAIN_NAVIGATION },
  { label: "Labs", items: LABS_NAVIGATION }
];
