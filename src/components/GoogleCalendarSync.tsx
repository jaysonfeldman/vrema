
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Loader2, Calendar, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const GoogleCalendarSync: React.FC = () => {
  const { authState, login, logout, isLoading: authLoading } = useGoogleAuth();
  const { 
    syncCalendar, 
    isLoading: syncLoading, 
    lastSynced, 
    events, 
    syncError,
    isAuthenticated
  } = useCalendarSync();

  const handleSync = () => {
    syncCalendar();
  };

  return (
    <Card className="p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-medium">Google Calendar</h3>
            {authState.isAuthenticated ? (
              <p className="text-sm text-gray-500">
                Connected as {authState.profile?.name || authState.profile?.email}
                {lastSynced && ` · Last synced ${format(lastSynced, 'MMM d, h:mm a')}`}
                {events.length > 0 && ` · ${events.length} events`}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Connect to import your events for time tracking</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {authState.isAuthenticated ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleSync} 
                disabled={syncLoading}
              >
                {syncLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Events
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => logout()}
                disabled={authLoading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              onClick={login} 
              disabled={authLoading}
            >
              {authLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="mr-2 h-4 w-4" />
              )}
              Connect Calendar
            </Button>
          )}
        </div>
      </div>
      
      {syncError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error: {syncError}. Please try disconnecting and reconnecting your Google Calendar.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default GoogleCalendarSync;
