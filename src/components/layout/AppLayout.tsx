import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { RefreshCWIcon, type RefreshCWIconHandle } from '@/components/icons/refresh-cw';
import { LogoutIcon, type LogoutIconHandle } from '@/components/icons/logout';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useSharedState } from '@/hooks/useSharedState';
import { useTeamStore } from '@/hooks/useTeamStore';
import { WithTooltip } from '@/components/ui/tooltip';
import { sound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import { stripDemoPrefix } from '@/lib/app-paths';

const pageTitles: Record<string, string> = {
  '/app': 'Dashboard',
  '/calendar': 'Calendar',
  '/team': 'Team members',
  '/projects': 'Projects',
  '/categories': 'Categories',
  '/guide': 'Guide',
  '/feedback': 'Feedback',
};

function getPageTitle(pathname: string): string {
  const path = stripDemoPrefix(pathname);
  if (path.startsWith('/projects/')) return 'Project';
  return pageTitles[path] ?? 'Vrema';
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authState, signOut, isDemoMode } = useGoogleAuth();
  const { syncCalendar, lastSynced } = useCalendarSync();
  const { isLoading } = useSharedState();
  const ensureOwner = useTeamStore((s) => s.ensureOwner);
  const seedDemoTeam = useTeamStore((s) => s.seedDemoTeam);
  const syncIconRef = useRef<RefreshCWIconHandle>(null);
  const logoutIconRef = useRef<LogoutIconHandle>(null);

  useEffect(() => {
    if (authState.user) {
      ensureOwner({
        id: authState.user.id,
        name: authState.user.name,
        email: authState.user.email,
        imageUrl: authState.user.imageUrl,
      });
    }
  }, [authState.user, ensureOwner]);

  useEffect(() => {
    if (isDemoMode) seedDemoTeam();
  }, [isDemoMode, seedDemoTeam]);

  const path = stripDemoPrefix(location.pathname);
  const isDashboard = path === '/app';
  const isCalendar = path === '/calendar';
  const isFullBleed = isDashboard || isCalendar;
  const handleSync = async () => {
    sound.click();
    try {
      await syncCalendar();
      sound.success();
    } catch {
      sound.error();
    }
  };

  const handleSignOut = () => {
    if (isDemoMode) return;
    sound.swoosh();
    signOut();
    navigate('/', { replace: true });
  };

  return (
    <SidebarProvider className="h-svh overflow-hidden bg-canvas has-[[data-variant=inset]]:!bg-canvas">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
        <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:px-6">
          <WithTooltip content="Toggle sidebar" side="bottom">
            <SidebarTrigger className="-ml-1" />
          </WithTooltip>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium text-muted-foreground">{getPageTitle(location.pathname)}</h1>

          <div className="ml-auto flex items-center gap-2">
            {lastSynced && (
              <WithTooltip
                content={`Last synced ${new Date(lastSynced).toLocaleString()}`}
                side="bottom"
              >
                <span className="hidden sm:inline-flex">
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 font-normal text-muted-foreground"
                  >
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Synced {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Badge>
                </span>
              </WithTooltip>
            )}
            <WithTooltip
              content={isLoading ? 'Syncing Google Calendar…' : 'Sync Google Calendar'}
              side="bottom"
            >
              <span className="inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 gap-1.5 px-2.5 text-xs active:scale-[0.97] transition-transform"
                  onClick={handleSync}
                  disabled={isLoading}
                  onMouseEnter={() => syncIconRef.current?.startAnimation()}
                  onMouseLeave={() => syncIconRef.current?.stopAnimation()}
                >
                  <RefreshCWIcon
                    ref={syncIconRef}
                    size={12}
                    className={cn(isLoading && '[&_svg]:animate-spin')}
                  />
                  <span className="hidden sm:inline">{isLoading ? 'Syncing…' : 'Sync'}</span>
                </Button>
              </span>
            </WithTooltip>
            <ThemeToggle />
            {!isDemoMode && (
              <WithTooltip content="Sign out" side="bottom">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="active:scale-[0.97] transition-transform"
                  onMouseEnter={() => logoutIconRef.current?.startAnimation()}
                  onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
                >
                  <LogoutIcon ref={logoutIconRef} size={16} />
                  <span className="sr-only">Sign out</span>
                </Button>
              </WithTooltip>
            )}
          </div>
        </header>

        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden bg-surface shadow-panel md:mx-4 md:mb-0 md:mt-0 md:rounded-t-2xl',
            isDemoMode ? 'md:min-h-0' : 'md:min-h-[calc(100svh-3.5rem-1rem)]'
          )}
        >
          {isFullBleed ? (
            <div
              className={cn(
                'min-h-0 flex-1',
                isCalendar ? 'overflow-hidden' : 'overflow-auto',
                isDemoMode && 'hide-scrollbar'
              )}
            >
              <Outlet />
            </div>
          ) : (
            <div className={cn('min-h-0 flex-1 overflow-auto p-4 md:p-6', isDemoMode && 'hide-scrollbar')}>
              <div className="mx-auto w-full max-w-5xl">
                <Outlet />
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
