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
  
  if (activityLower.includes('design')) return 'bg-[#FEF18B] text-slate-900 border-[#FEF18B]'; // Flax
  if (activityLower.includes('dev') || activityLower.includes('development')) return 'bg-[#7ED3FC] text-slate-900 border-[#7ED3FC]'; // Pale azure
  if (activityLower.includes('meet') || activityLower.includes('call')) return 'bg-[#D1FAE5] text-slate-900 border-[#D1FAE5]'; // Nyanza
  if (activityLower.includes('plan') || activityLower.includes('strat')) return 'bg-[#6EE7B7] text-slate-900 border-[#6EE7B7]'; // Aquamarine
  if (activityLower.includes('admin')) return 'bg-[#FED8AA] text-slate-900 border-[#FED8AA]'; // Sunset
  if (activityLower.includes('pm')) return 'bg-[#22C55F] text-white border-[#22C55F]'; // Emerald
  
  // Generate a consistent color based on the activity type
  const color = stringToColor(activityType);
  return `bg-[${color}] text-white border-[${color}]`;
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
