/**
 * 🎯 ENHANCED LAYOUT - Labs 2.0 Navigation System
 * The new Layout component powered by our unified navigation architecture
 * Features mobile-first responsive design and Lovable's UX enhancements!
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Menu, X, LogOut, Heart, FlaskConical, ArrowLeft, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';

// Import our new navigation system
import { NavigationContainer } from '@/components/navigation/NavigationContainer';
import { navigationConfig, mobileNavigationConfig, findNavigationItem } from '@/config/navigation';

export function LayoutEnhanced() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();

  // 🧪 LABS MODE DETECTION - Restore original Labs 2.0 aesthetic!
  const isLabsMode = location.pathname.startsWith('/labs');

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Get current page title from navigation config
  const getCurrentPageTitle = () => {
    for (const group of navigationConfig.groups) {
      for (const item of group.items) {
        if (item.href === location.pathname ||
            (item.href !== '/' && location.pathname.startsWith(item.href))) {
          return item.title;
        }
      }
    }
    return 'Dashboard 2.0';
  };

  // Handle navigation item clicks
  const handleNavigationClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Choose configuration based on screen size
  const currentConfig = isMobile ? mobileNavigationConfig : navigationConfig;

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside
        className={cn(
          // Base positioning and sizing
          'fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-smooth',

          // Mobile behavior
          isMobile ? [
            'w-80', // Wider on mobile for better touch targets
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          ] : [
            'w-72', // Desktop width
            'translate-x-0' // Always visible on desktop
          ],

          // Enhanced visual styling
          'backdrop-blur-xl border-r',
          navigationConfig.theme === 'labs' ? [
            'bg-card-labs-glass',
            'border-labs',
            'shadow-card-labs'
          ] : [
            'bg-card/95',
            'border-border/50',
            'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]'
          ]
        )}
        style={{ height: '100vh' }}
      >
        {/* Floating Particles Background - Enhanced for Labs theme */}
        {navigationConfig.theme === 'labs' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[15%] w-2 h-2 rounded-full bg-primary/20 animate-float-slow" />
            <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 rounded-full bg-accent/30 animate-float-medium" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[50%] left-[25%] w-1 h-1 rounded-full bg-primary/15 animate-float-fast" style={{ animationDelay: '2s' }} />
            <div className="absolute top-[70%] left-[80%] w-2 h-2 rounded-full bg-accent/20 animate-float-slow" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-[85%] left-[40%] w-1.5 h-1.5 rounded-full bg-primary/25 animate-float-medium" style={{ animationDelay: '1.5s' }} />
          </div>
        )}

        <div className="flex h-full flex-col relative z-10">
          {/* Enhanced Header */}
          <div className="flex items-center gap-3 p-6 border-b border-labs">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-glow transition-transform duration-500 hover:rotate-[360deg]">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground-labs">
                {navigationConfig.theme === 'labs' ? 'TeddyKids Labs 2.0' : 'TeddyKids LMS'}
              </h1>
              <p className="text-xs text-muted-foreground-labs">
                {navigationConfig.theme === 'labs' ? 'Enhanced Admin Portal' : 'Admin Portal'}
              </p>
            </div>

            {/* Mobile close button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-accent/50"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Navigation Container - This is where the magic happens! */}
          <div className="flex-1 overflow-hidden">
            <NavigationContainer
              config={currentConfig}
              onItemClick={handleNavigationClick}
              className="h-full border-none shadow-none bg-transparent"
            />
          </div>

          {/* Enhanced Footer */}
          <div className="p-4 border-t border-labs backdrop-blur-sm">
            <div className="text-xs text-muted-foreground-labs text-center font-medium">
              {navigationConfig.theme === 'labs' ? (
                <>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span>🧪</span>
                    <span>Labs 2.0 Enhanced</span>
                  </div>
                  <div>© 2024 TeddyKids LMS</div>
                </>
              ) : (
                '© 2024 TeddyKids LMS'
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0 transition-all duration-500 relative',
        isMobile ? 'ml-0' : 'lg:ml-72'
      )}>
        {/* Enhanced Top bar */}
        <header className={cn(
          'sticky top-0 z-30 flex items-center gap-4 px-4 py-3 border-b transition-theme',
          navigationConfig.theme === 'labs' ? [
            'bg-card-labs-glass',
            'border-labs',
            'backdrop-blur-xl'
          ] : [
            'bg-card/95',
            'border-border',
            'backdrop-blur-sm'
          ],
          'lg:px-6'
        )}>
          {/* Mobile menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-accent/50"
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}

          {/* Page title with enhanced styling */}
          <div className="flex-1">
            <h2 className={cn(
              'text-lg font-semibold transition-colors',
              navigationConfig.theme === 'labs' ? 'text-foreground-labs' : 'text-foreground'
            )}>
              {getCurrentPageTitle()}
            </h2>
            {navigationConfig.theme === 'labs' && (
              <div className="text-xs text-muted-foreground-labs">
                Powered by Labs 2.0 ✨
              </div>
            )}
          </div>

          {/* Enhanced action bar */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-px h-6 bg-border-labs mx-1" />
            <NotificationBell />

            {/* User info with enhanced styling */}
            <div className={cn(
              'text-sm hidden sm:block',
              navigationConfig.theme === 'labs' ? 'text-muted-foreground-labs' : 'text-muted-foreground'
            )}>
              {user?.email}
            </div>

            {/* Enhanced sign out button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className={cn(
                'gap-2 transition-theme',
                navigationConfig.theme === 'labs' && 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Enhanced page content */}
        <main className={cn(
          'flex-1 p-4 lg:p-6 transition-theme',
          navigationConfig.theme === 'labs' && 'bg-background'
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Export both for flexibility
export { LayoutEnhanced as Layout };