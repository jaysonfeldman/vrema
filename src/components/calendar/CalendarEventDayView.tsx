
import React from 'react';
import { GoogleCalendarEvent } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { parseEventTitle } from '@/services/googleCalendarService';
import { format } from 'date-fns';
import { stringToColor } from '@/lib/utils';

interface CalendarEventDayViewProps {
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

const CalendarEventDayView: React.FC<CalendarEventDayViewProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No events found. Try adjusting your filters or sync your calendar.
      </div>
    );
  }

  // Group events by day
  const eventsByDay = events.reduce((acc, event) => {
    const day = event.start.dateTime.split('T')[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  return (
    <div className="space-y-8">
      {Object.entries(eventsByDay)
        .sort(([dayA], [dayB]) => dayB.localeCompare(dayA))
        .map(([day, dayEvents]) => (
          <div key={day} className="space-y-2">
            <div className="sticky top-0 bg-background pt-2 pb-1 z-10">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(day), 'EEEE, MMMM d, yyyy')}
              </h3>
            </div>
            
            <div className="grid gap-2">
              {dayEvents
                .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
                .map((event) => {
                  const { projectName, activityType, description } = parseEventTitle(event.summary);
                    
                  return (
                    <div 
                      key={event.id} 
                      className="rounded-md border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{description || '(No description)'}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(event.start.dateTime), 'h:mm a')} - {format(new Date(event.end.dateTime), 'h:mm a')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{projectName}</Badge>
                          <Badge className={getActivityColor(activityType).split(' ')[0]}>
                            #{activityType}
                          </Badge>
                          <span className="text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {format(
                              new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime(),
                              'H:mm'
                            ).replace(/^0:/, '')}
                          </span>
                        </div>
                      </div>
                      {event.description && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {event.description}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
    </div>
  );
};

export default CalendarEventDayView;
