
import React from 'react';
import { GoogleCalendarEvent } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { parseEventTitle, formatEventDate, calculateDuration } from '@/services/googleCalendarService';
import { stringToColor } from '@/lib/utils';

interface CalendarEventListViewProps {
  events: GoogleCalendarEvent[];
}

// Helper function to get activity color
const getActivityColor = (activityType: string): string => {
  // Map common activity types to specific colors for consistency
  switch (activityType.toLowerCase()) {
    case 'design':
      return 'bg-[#fef18b] text-slate-900 border-[#fef18b]';
    case 'strategy':
      return 'bg-[#22c55f] text-white border-[#22c55f]';
    case 'dev':
      return 'bg-[#7ed3fc] text-slate-900 border-[#7ed3fc]';
    case 'meetings':
      return 'bg-[#6ee7b7] text-slate-900 border-[#6ee7b7]';
    case 'admin':
      return 'bg-[#d1fae5] text-slate-900 border-[#d1fae5]';
    default:
      // Generate a consistent color based on the activity type
      const color = stringToColor(activityType);
      return `bg-[${color}] text-white border-[${color}]`;
  }
};

const CalendarEventListView: React.FC<CalendarEventListViewProps> = ({ events }) => {
  // Memoize the rendering to prevent unnecessary updates
  const renderEvents = React.useMemo(() => {
    if (events.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
            No events found. Try adjusting your filters or sync your calendar.
          </TableCell>
        </TableRow>
      );
    }
    
    return events.map((event) => {
      const { projectName, activityType, description } = parseEventTitle(event.summary);
      
      return (
        <TableRow key={event.id}>
          <TableCell>
            <Badge variant="outline">{projectName}</Badge>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className={getActivityColor(activityType)}>
              #{activityType}
            </Badge>
          </TableCell>
          <TableCell className="font-medium">{description || '(No description)'}</TableCell>
          <TableCell>{formatEventDate(event.start.dateTime)}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {calculateDuration(event.start.dateTime, event.end.dateTime)}
            </div>
          </TableCell>
        </TableRow>
      );
    });
  }, [events]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderEvents}
        </TableBody>
      </Table>
    </div>
  );
};

export default React.memo(CalendarEventListView);
