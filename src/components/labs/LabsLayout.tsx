/**
 * 🧪 LABS 2.0 LAYOUT COMPONENT
 * Special experimental layout for advanced AI-powered features
 */

import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  FlaskConical,
  Dna,
  Atom,
  Heart,
  Gamepad2,
  BarChart4,
  Zap,
  Brain,
  Sparkles,
  ArrowLeft,
  Users,
  LayoutDashboard,
  Eye,
  Settings,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const labsNavigationItems = [
  {
    title: "Overview",
    url: "/labs",
    icon: LayoutDashboard,
    description: "Labs 2.0 Command Center",
    status: "active" as const,
  },
  {
    title: "Staff 2.0",
    url: "/labs/staff",
    icon: Users,
    description: "Enhanced Staff Management",
    status: "active" as const,
  },
  {
    title: "Talent Acquisition",
    url: "/labs/talent",
    icon: UserPlus,
    description: "AI-Powered Hiring Pipeline",
    status: "beta" as const,
  },
  {
    title: "Contract DNA",
    url: "/labs/dna",
    icon: Dna,
    description: "Employment Genetic Analysis",
    status: "beta" as const,
  },
  {
    title: "Quantum Dashboard",
    url: "/labs/quantum",
    icon: Atom,
    description: "Probability State Visualization",
    status: "beta" as const,
  },
  {
    title: "Emotion Engine",
    url: "/labs/emotions",
    icon: Heart,
    description: "AI Emotional Intelligence",
    status: "experimental" as const,
  },
  {
    title: "Gamification",
    url: "/labs/game",
    icon: Gamepad2,
    description: "RPG Employee System",
    status: "experimental" as const,
  },
  {
    title: "Time Travel",
    url: "/labs/time",
    icon: Zap,
    description: "Timeline Simulation & What-If Analysis",
    status: "experimental" as const,
  },
  {
    title: "Team Mood Mapping",
    url: "/labs/mood",
    icon: Brain,
    description: "Emotional Health & Burnout Prevention",
    status: "experimental" as const,
  },
];

const statusColors = {
  active: "bg-green-500/20 text-green-700 border-green-500/30",
  beta: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  experimental: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  future: "bg-purple-500/20 text-purple-700 border-purple-500/30",
};

export function LabsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/labs") return location.pathname === "/labs";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Labs Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-purple-500/30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Production</span>
            </NavLink>

            <div className="h-6 w-px bg-purple-500/30" />

            <div className="flex items-center gap-3">
              <div className="relative">
                <FlaskConical className="h-8 w-8 text-purple-400" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  TeddyKids Labs 2.0
                </h1>
                <p className="text-xs text-purple-300">
                  Experimental AI-Powered Features
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-purple-500/20 text-purple-300 border-purple-500/30"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Mode
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Labs Sidebar */}
        <div className="w-80 bg-black/30 backdrop-blur-lg border-r border-purple-500/30 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-1">
              Experimental Features
            </h2>
            <p className="text-sm text-purple-300 mb-6">
              Advanced AI-powered tools and visualizations
            </p>

            <nav className="space-y-2">
              {labsNavigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                const isDisabled = item.status === 'future';

                return (
                  <div key={item.url} className="relative">
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                        active
                          ? "bg-purple-500/30 text-white border border-purple-500/50"
                          : isDisabled
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-purple-200 hover:bg-purple-500/20 hover:text-white"
                      )}
                      onClick={(e) => isDisabled && e.preventDefault()}
                    >
                      <Icon className={cn(
                        "h-5 w-5 transition-transform",
                        active && "scale-110",
                        !isDisabled && "group-hover:scale-105"
                      )} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {item.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs px-1.5 py-0.5 h-5",
                              statusColors[item.status]
                            )}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-purple-300 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      {active && (
                        <div className="absolute -right-px top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-400 rounded-l" />
                      )}
                    </NavLink>
                  </div>
                );
              })}
            </nav>

            {/* Labs Stats */}
            <div className="mt-8 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <h3 className="text-sm font-medium text-white mb-3">
                🧪 Labs Statistics
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-purple-300">
                  <span>Active Features:</span>
                  <span className="text-green-400">2</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Beta Features:</span>
                  <span className="text-blue-400">3</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Experimental:</span>
                  <span className="text-orange-400">4</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Coming Soon:</span>
                  <span className="text-purple-400">1</span>
                </div>
              </div>
            </div>

            {/* Warning Notice */}
            <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-300">
                  <span className="font-medium">Experimental Zone:</span>
                  <br />
                  Features may be unstable and are for testing purposes only.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Labs Content */}
        <div className="flex-1 min-h-screen">
          <div className="relative">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />

            {/* Content */}
            <div className="relative p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}