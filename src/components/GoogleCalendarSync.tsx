
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Loader2, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const GoogleCalendarSync: React.FC = () => {
  const { authState, login, logout, isLoading: authLoading } = useGoogleAuth();
  const { syncCalendar, isLoading: syncLoading, lastSynced } = useCalendarSync();

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-medium">Google Calendar</h3>
            {authState.isAuthenticated ? (
              <p className="text-sm text-gray-500">
                Connected as {authState.profile?.name || authState.profile?.email}
                {lastSynced && ` · Last synced ${format(lastSynced, 'MMM d, h:mm a')}`}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Connect to import your events</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {authState.isAuthenticated ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => syncCalendar()} 
                disabled={syncLoading}
              >
                {syncLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sync Now
              </Button>
              <Button 
                variant="outline" 
                onClick={logout}
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
              {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GoogleCalendarSync;
