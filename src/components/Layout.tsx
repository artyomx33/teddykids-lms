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
  Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Contracts",
    url: "/contracts",
    icon: FileText,
  },
  {
    title: "Staff",
    url: "/staff",
    icon: Users,
  },
  {
    title: "Generate New Contract",
    url: "/generate-contract",
    icon: Plus,
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
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
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-smooth lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-border">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Teddy Kids</h1>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    active
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.title}
                </NavLink>
              );
            })}
            
            {/* Grow Group Header */}
            <button
              onClick={() => {
                setGrowOpen(!growOpen);
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                "hover:bg-accent hover:text-accent-foreground",
                isActive("/grow")
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground"
              )}
            >
              <Sprout className="w-4 h-4" />
              Grow
            </button>
            
            {/* Grow Subitems */}
            {growOpen && (
              <NavLink
                to="/grow/onboarding"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 pl-8",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground"
                )}
              >
                <span>Onboarding</span>
              </NavLink>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              © 2024 Teddy Kids LMS
            </div>
          </div>
        </div>
      </aside>

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
            <div className="text-sm text-muted-foreground">
              Welcome back, Admin
            </div>
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
