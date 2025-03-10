
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
  // Use the specified palette colors
  const activityLower = activityType.toLowerCase();
  
  if (activityLower.includes('design')) return 'bg-flax text-slate-900 border-flax'; // Flax - soft yellow
  if (activityLower.includes('dev') || activityLower.includes('development')) return 'bg-pale_azure text-slate-900 border-pale_azure'; // Pale azure - soft blue
  if (activityLower.includes('meet') || activityLower.includes('call')) return 'bg-nyanza text-slate-900 border-nyanza'; // Nyanza - soft green
  if (activityLower.includes('plan') || activityLower.includes('strat')) return 'bg-aquamarine text-slate-900 border-aquamarine'; // Aquamarine - soft green
  if (activityLower.includes('admin')) return 'bg-sunset text-slate-900 border-sunset'; // Sunset - soft peach
  if (activityLower.includes('pm')) return 'bg-emerald text-white border-emerald'; // Emerald - bright green
  
  // Simple hash function to generate a consistent color
  const getColorClass = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };
  
  // All colors from the palette
  const colors = [
    'bg-emerald text-white border-emerald',
    'bg-nyanza text-slate-900 border-nyanza',
    'bg-sunset text-slate-900 border-sunset',
    'bg-aquamarine text-slate-900 border-aquamarine',
    'bg-flax text-slate-900 border-flax',
    'bg-pale_azure text-slate-900 border-pale_azure'
  ];
  
  return getColorClass(activityType);
};

const CalendarEventListView: React.FC<CalendarEventListViewProps> = ({ events }) => {
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
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No events found. Try adjusting your filters or sync your calendar.
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => {
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
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CalendarEventListView;
