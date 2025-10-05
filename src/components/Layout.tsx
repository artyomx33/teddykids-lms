import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Users,
  Settings,
  Menu,
  X,
  Heart,
  Sprout,
  GraduationCap,
  Star,
  BarChart3,
  Activity,
  Brain,
  Calendar,
  Mail,
  LogOut,
  FlaskConical,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Staff",
    url: "/staff",
    icon: Users,
  },
  {
    title: "Interns",
    url: "/interns",
    icon: GraduationCap,
  },
  {
    title: "Reviews", 
    url: "/reviews",
    icon: Star,
  },
  {
    title: "Contracts",
    url: "/contracts",
    icon: FileText,
  },
  {
    title: "Reports",
    url: "/reports", 
    icon: BarChart3,
  },
  {
    title: "Activity Feed",
    url: "/activity",
    icon: Activity,
  },
  {
    title: "Email",
    url: "/email",
    icon: Mail,
  },
  {
    title: "Employes Sync",
    url: "/employes-sync",
    icon: Users,
  },
  {
    title: "Compliance",
    url: "/compliance",
    icon: ShieldCheck,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: Brain,
  },
  {
    title: "Labs 2.0",
    url: "/labs",
    icon: FlaskConical,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [growOpen, setGrowOpen] = useState(true);
  const location = useLocation();
  const { signOut, user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 backdrop-blur-xl bg-card/95 border-r border-border/50 lg:translate-x-0",
          "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <motion.div 
            className="flex items-center gap-3 p-6 border-b border-border/50"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div 
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-glow"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Heart className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Teddy Kids</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto lg:hidden hover:bg-accent/50"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              
              return (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink
                    to={item.url}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                      active
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-primary rounded-xl"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("w-4 h-4 relative z-10", active && "drop-shadow-lg")} />
                    <span className="relative z-10">{item.title}</span>
                    {active && (
                      <motion.div
                        className="absolute right-2 w-1.5 h-1.5 bg-primary-foreground rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </NavLink>
                </motion.div>
              );
            })}
            
            {/* Grow Group Header */}
            <motion.button
              onClick={() => setGrowOpen(!growOpen)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full relative overflow-hidden group",
                isActive("/grow")
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sprout className="w-4 h-4" />
              <span className="flex-1 text-left">Grow</span>
              <motion.div
                animate={{ rotate: growOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>
            
            {/* Grow Subitems */}
            <AnimatePresence>
              {growOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-1 pl-4"
                >
                  <NavLink
                    to="/grow/knowledge"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                      "hover:bg-accent/50 hover:text-foreground",
                      isActive || location.pathname.startsWith("/grow/knowledge")
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Knowledge Center</span>
                  </NavLink>
                  <NavLink
                    to="/grow/onboarding"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                      "hover:bg-accent/50 hover:text-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Onboarding</span>
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Footer */}
          <motion.div 
            className="p-4 border-t border-border/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-xs text-muted-foreground text-center font-medium">
              © 2024 Teddy Kids LMS
            </div>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-card/95 backdrop-blur-sm border-b border-border lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              {navigationItems.find(item => isActive(item.url))?.title || 
               (isActive("/grow") ? "Grow" : "Dashboard")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="text-sm text-muted-foreground">
              {user?.email}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
