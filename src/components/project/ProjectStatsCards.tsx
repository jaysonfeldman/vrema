
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, DollarSign } from 'lucide-react';
import { Project, GoogleCalendarEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ProjectStatsCardsProps {
  project: Project;
  projectEvents: GoogleCalendarEvent[];
  syncCalendar: (days: number) => void;
}

const ProjectStatsCards: React.FC<ProjectStatsCardsProps> = ({
  project,
  projectEvents,
  syncCalendar,
}) => {
  // Format hours display
  const formatHoursDisplay = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Time Logged
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatHoursDisplay(project.totalHours)}</div>
          {project.budgetHours && (
            <div className="text-sm text-muted-foreground">
              Budget: {formatHoursDisplay(project.budgetHours)}
            </div>
          )}
        </CardContent>
      </Card>
      
      {project.hourlyRate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Earned Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(project.totalHours * project.hourlyRate).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              Rate: ${project.hourlyRate}/hr
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{projectEvents.length}</div>
          <div className="text-sm text-muted-foreground">
            Filter: {project.filterTerm || project.name}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectStatsCards;
