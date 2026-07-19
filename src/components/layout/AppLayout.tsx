import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { RefreshCWIcon } from '@/components/icons/refresh-cw';
import { LogoutIcon } from '@/components/icons/logout';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useSharedState } from '@/hooks/useSharedState';
import { useToast } from '@/components/ui/use-toast';
import { sound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/activities': 'Activities',
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/projects/')) return 'Project Detail';
  return pageTitles[pathname] ?? 'Vrema';
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut: signOutGoogle } = useGoogleAuth();
  const { signOut: signOutSupabase } = useAuth();
  const { syncCalendar, lastSynced } = useCalendarSync();
  const { isLoading } = useSharedState();
  const { toast } = useToast();

  const isDashboard = location.pathname === '/';

  const handleSync = async () => {
    sound.click();
    try {
      await syncCalendar();
      sound.success();
      toast({ title: 'Calendar synced', description: 'Your events have been updated.' });
    } catch {
      sound.error();
      toast({ title: 'Sync failed', description: 'Could not sync your calendar.', variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    sound.swoosh();
    await signOutSupabase();
    signOutGoogle();
    navigate('/login', { replace: true });
  };

  return (
    <SidebarProvider className="bg-canvas has-[[data-variant=inset]]:!bg-canvas">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-canvas">
        <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium text-muted-foreground">{getPageTitle(location.pathname)}</h1>

          <div className="ml-auto flex items-center gap-2">
            {lastSynced && (
              <Badge
                variant="secondary"
                className="hidden items-center gap-1.5 font-normal text-muted-foreground sm:inline-flex"
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                Synced {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-6 gap-1.5 px-2.5 text-xs active:scale-[0.97] transition-transform"
              onClick={handleSync}
              disabled={isLoading}
            >
              <RefreshCWIcon size={12} className={cn(isLoading && '[&_svg]:animate-spin')} />
              <span className="hidden sm:inline">{isLoading ? 'Syncing…' : 'Sync'}</span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
              className="active:scale-[0.97] transition-transform"
            >
              <LogoutIcon size={16} />
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden bg-surface shadow-panel md:m-4 md:mt-0 md:min-h-[calc(100svh-3.5rem-1rem)] md:rounded-2xl">
          {isDashboard ? (
            <Outlet />
          ) : (
            <div className="flex-1 overflow-auto p-4 md:p-6">
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
