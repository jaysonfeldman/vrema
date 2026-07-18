import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useSharedState } from '@/hooks/useSharedState';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, LogOut } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const { authState, signOut } = useGoogleAuth();
  const { syncCalendar, lastSynced } = useCalendarSync();
  const { isLoading } = useSharedState();
  const { toast } = useToast();

  const handleSync = async () => {
    await syncCalendar();
    toast({
      title: "Calendar Synced",
      description: "Your calendar events have been updated.",
    });
  };

  return (
    <header className="border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-8">
          <Link to="/" className="font-medium">
            timetracker2400
          </Link>
          
          {authState.isAuthenticated && lastSynced && (
            <div className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Last synced {new Date(lastSynced).toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <nav className="flex space-x-8">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-gray-900",
                location.pathname === "/" 
                  ? "text-gray-900 border-b-2 border-gray-900 pb-1" 
                  : "text-gray-500"
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={cn(
                "text-sm font-medium transition-colors hover:text-gray-900",
                location.pathname.startsWith("/projects")
                  ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                  : "text-gray-500"
              )}
            >
              Projects
            </Link>
            <Link
              to="/activities"
              className={cn(
                "text-sm font-medium transition-colors hover:text-gray-900",
                location.pathname === "/activities"
                  ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                  : "text-gray-500"
              )}
            >
              Activities
            </Link>
          </nav>

          {authState.isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              <span>{isLoading ? "Syncing..." : "Sync Calendar"}</span>
            </Button>
          )}

          {authState.isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={authState.user?.imageUrl} />
                <AvatarFallback>{authState.user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Sign out"
                className="text-gray-500 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
