import { useState, useRef } from "react";
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
  ChevronDown,
  Dna,
  Atom,
  Gamepad2,
  Clock,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const labsItems = [
  {
    title: "Contract DNA 2.0",
    url: "/labs/dna",
    icon: Dna,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Quantum Dashboard 2.0",
    url: "/labs/quantum",
    icon: Atom,
    color: "from-purple-500 to-violet-600",
  },
  {
    title: "Emotional Intelligence 2.0",
    url: "/labs/emotions",
    icon: Heart,
    color: "from-pink-500 to-rose-600",
  },
  {
    title: "Gamification 2.0",
    url: "/labs/game",
    icon: Gamepad2,
    color: "from-orange-500 to-amber-600",
  },
  {
    title: "Time Travel 2.0",
    url: "/labs/time",
    icon: Clock,
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Team Mood Mapping 2.0",
    url: "/labs/mood",
    icon: Brain,
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "Talent Acquisition 2.0",
    url: "/labs/talent",
    icon: UserPlus,
    color: "from-teal-500 to-emerald-600",
  },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [growOpen, setGrowOpen] = useState(true);
  const [labsOpen, setLabsOpen] = useState(true);
  const [ripplePosition, setRipplePosition] = useState<{x: number, y: number, id: string} | null>(null);
  const location = useLocation();
  const { signOut, user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleRippleClick = (e: React.MouseEvent<HTMLAnchorElement>, itemUrl: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipplePosition({ x, y, id: itemUrl });
    setTimeout(() => setRipplePosition(null), 600);
  };

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full backdrop-blur-xl bg-card/95 border-r border-border/50 transition-all duration-500 ease-smooth z-50",
          "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-y-auto overflow-x-hidden",
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-16" : "w-64"
        )}
        style={{ height: '100vh', position: 'fixed' }}
      >
        {/* Floating Particles Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[15%] w-2 h-2 rounded-full bg-primary/20 animate-float-slow" />
          <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 rounded-full bg-accent/30 animate-float-medium" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[50%] left-[25%] w-1 h-1 rounded-full bg-primary/15 animate-float-fast" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[70%] left-[80%] w-2 h-2 rounded-full bg-accent/20 animate-float-slow" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[85%] left-[40%] w-1.5 h-1.5 rounded-full bg-primary/25 animate-float-medium" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[20%] left-[60%] w-1 h-1 rounded-full bg-accent/15 animate-float-fast" style={{ animationDelay: '2.5s' }} />
        </div>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center gap-3 border-b border-border/50 transition-all duration-300",
            collapsed ? "p-3 justify-center" : "p-6"
          )}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-glow hover:scale-110 transition-all duration-300"
            >
              <Menu className="w-5 h-5 text-primary-foreground" />
            </button>
            {!collapsed && (
              <>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-glow transition-transform duration-500 hover:rotate-[360deg]">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Teddy Kids</h1>
                  <p className="text-xs text-muted-foreground">Admin Portal</p>
                </div>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto lg:hidden hover:bg-accent/50"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 space-y-1 overflow-y-auto",
            collapsed ? "p-2" : "p-4"
          )}>
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              const showRipple = ripplePosition?.id === item.url;
              
              return (
                <div
                  key={item.url}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                    <NavLink
                    to={item.url}
                    onClick={(e) => {
                      handleRippleClick(e, item.url);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                      "hover:translate-x-1 active:scale-95",
                      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/0 before:via-primary/10 before:to-accent/10",
                      "before:bg-[length:200%_100%] before:bg-left hover:before:bg-right before:transition-all before:duration-700",
                      collapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                      active
                        ? "bg-gradient-primary text-primary-foreground shadow-glow scale-[1.02]"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {/* Ripple effect */}
                    {showRipple && (
                      <span 
                        className="absolute rounded-full bg-primary/30 animate-ripple pointer-events-none"
                        style={{
                          left: ripplePosition.x - 50,
                          top: ripplePosition.y - 50,
                          width: 100,
                          height: 100,
                        }}
                      />
                    )}
                    
                    {/* Magnetic glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-smooth" />
                    
                    <Icon className={cn(
                      "w-4 h-4 relative z-10 transition-all duration-300",
                      "group-hover:scale-125 group-hover:rotate-12",
                      active && "drop-shadow-lg animate-pulse"
                    )} />
                    {!collapsed && <span className="relative z-10">{item.title}</span>}
                    
                    {/* Animated Progress Bar for Active Route */}
                    {active && (
                      <>
                        <div className="absolute right-2 w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse z-10" />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground to-primary-foreground/0 animate-progress-slide" />
                      </>
                    )}
                  </NavLink>
                </div>
              );
            })}
            
            {!collapsed && (
              <>
                {/* Grow Group Header */}
                <button
                  onClick={() => setGrowOpen(!growOpen)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full relative overflow-hidden group hover:scale-[1.01]",
                    isActive("/grow")
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Sprout className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="flex-1 text-left">Grow</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", growOpen && "rotate-180")} />
                </button>
                
                {/* Grow Subitems */}
                <div className={cn(
                  "space-y-1 pl-4 overflow-hidden transition-all duration-300",
                  growOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <NavLink
                    to="/grow/knowledge"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                      "hover:bg-accent/50 hover:text-foreground hover:scale-[1.01]",
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
                      "hover:bg-accent/50 hover:text-foreground hover:scale-[1.01]",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Onboarding</span>
                  </NavLink>
                </div>

                {/* Labs 2.0 Section */}
                <div className="pt-4">
                  <button
                    onClick={() => setLabsOpen(!labsOpen)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full relative overflow-hidden group hover:scale-[1.01]",
                      isActive("/labs")
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-600/10"
                    )}
                  >
                    <FlaskConical className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span className="flex-1 text-left">🧪 Labs 2.0</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", labsOpen && "rotate-180")} />
                  </button>

                  {/* Labs 2.0 Subitems */}
                  <div className={cn(
                    "space-y-1 pl-4 overflow-hidden transition-all duration-500",
                    labsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    {labsItems.map((item, index) => {
                      const Icon = item.icon;
                      const isLabActive = location.pathname === item.url;
                      return (
                        <NavLink
                          key={item.url}
                          to={item.url}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                            "hover:scale-[1.02] hover:translate-x-1",
                            isLabActive
                              ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <Icon className={cn(
                            "w-3.5 h-3.5 transition-all duration-300",
                            "group-hover:scale-110",
                            isLabActive && "drop-shadow-lg"
                          )} />
                          <span className="relative z-10">{item.title}</span>
                          {isLabActive && (
                            <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse z-10" />
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="text-xs text-muted-foreground text-center font-medium">
              © 2024 Teddy Kids LMS
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-500 relative",
        collapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
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
               labsItems.find(item => isActive(item.url))?.title ||
               (isActive("/grow") ? "Grow" :
                isActive("/labs") ? "🧪 Labs 2.0" : "Dashboard")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-px h-6 bg-border mx-1" />
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
