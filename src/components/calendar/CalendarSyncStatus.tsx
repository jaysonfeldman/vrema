
import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';

interface CalendarSyncStatusProps {
  lastSynced: Date | null;
  isLoading: boolean;
  onSync: () => void;
}

const CalendarSyncStatus: React.FC<CalendarSyncStatusProps> = ({ 
  lastSynced, 
  isLoading, 
  onSync 
}) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {lastSynced && (
        <span>Last synced: {format(lastSynced, 'MMM d, h:mm a')}</span>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSync}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          'Sync Now'
        )}
      </Button>
    </div>
  );
};

export default CalendarSyncStatus;
