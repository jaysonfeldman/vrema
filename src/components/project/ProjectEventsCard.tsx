
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleCalendarEvent } from '@/lib/types';
import CalendarEventListView from '@/components/calendar/CalendarEventListView';

interface ProjectEventsCardProps {
  projectEvents: GoogleCalendarEvent[];
  syncCalendar: (days: number) => void;
}

const ProjectEventsCard: React.FC<ProjectEventsCardProps> = ({
  projectEvents,
  syncCalendar,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projectEvents.length > 0 ? (
          <CalendarEventListView events={projectEvents} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No events found for this project.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try changing the filter term in project settings or syncing more calendar data.
            </p>
            <Button 
              onClick={() => syncCalendar(90)} 
              className="mt-4"
            >
              Sync Calendar Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectEventsCard;
