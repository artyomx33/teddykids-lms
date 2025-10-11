import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { NavigationContainer } from '@/components/navigation/NavigationContainer';
import { findNavigationItem, mobileNavigationSections, navigationSections } from '@/config/navigation';

export function LayoutEnhanced() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, location.pathname]);

  const navSections = isMobile ? mobileNavigationSections : navigationSections;

  const currentItem = useMemo(() => findNavigationItem(location.pathname), [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-background">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40"
          aria-label="Close navigation overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 border-r bg-card transition-transform',
          isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">TeddyKids LMS</p>
            <p className="text-xs text-muted-foreground">Admin console</p>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <NavigationContainer sections={navSections} onItemClick={() => isMobile && setSidebarOpen(false)} />
      </aside>

      <div className={cn('flex min-h-screen flex-col', isMobile ? 'pl-0' : 'pl-64')}>
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div>
              <p className="text-sm font-semibold">{currentItem?.label ?? 'Dashboard'}</p>
              {currentItem?.description && (
                <p className="text-xs text-muted-foreground">{currentItem.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
