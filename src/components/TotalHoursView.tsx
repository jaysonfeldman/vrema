
import React from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ActivityTag from './ActivityTag';
import { Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const TotalHoursView: React.FC = () => {
  const { 
    getTotalHours, 
    getActivityHours, 
    customProjects, 
    filters, 
    updateFilters,
    events,
    filteredEvents,
    lastSynced
  } = useCalendarSync();
  
  const totalHours = getTotalHours();
  
  // Format time to hours and minutes
  const formatTime = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };
  
  // Calculate hours by activity type
  const activityTypes: { type: 'design' | 'strategy' | 'dev' | 'meetings' | 'admin', label: string }[] = [
    { type: 'design', label: 'Design' },
    { type: 'strategy', label: 'Strategy' },
    { type: 'dev', label: 'Development' },
    { type: 'meetings', label: 'Meetings' },
    { type: 'admin', label: 'Admin' }
  ];
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Total Hours Overview</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {filters.dateRange === 30 ? 'Last 30 days' : 
               filters.dateRange === 7 ? 'Last week' : 
               filters.dateRange === 90 ? 'Last 3 months' : 
               `Last ${filters.dateRange} days`}
            </span>
          </Badge>
          
          <Select
            value={filters.dateRange.toString()}
            onValueChange={(value) => updateFilters({ dateRange: parseInt(value) })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Hours Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Hours Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{formatTime(totalHours)}</div>
              <div className="text-muted-foreground">
                from {filteredEvents.length} events
                {lastSynced && (
                  <div className="text-xs mt-1">
                    Last synced: {format(lastSynced, 'MMM d, h:mm a')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              {activityTypes.map(activity => {
                const hours = getActivityHours(activity.type);
                const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
                
                return (
                  <div key={activity.type} className="relative">
                    <ActivityTag
                      type={activity.type}
                      hours={hours}
                    />
                    <div className="mt-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: 
                            activity.type === 'design' ? 'rgb(34, 197, 94)' :
                            activity.type === 'strategy' ? 'rgb(59, 130, 246)' :
                            activity.type === 'dev' ? 'rgb(168, 85, 247)' :
                            activity.type === 'meetings' ? 'rgb(234, 179, 8)' :
                            'rgb(239, 68, 68)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Projects Overview Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Projects Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {customProjects.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                <p>No project views created yet</p>
                <p className="text-xs mt-1">Go to the Projects tab to create custom project views</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customProjects.map(project => {
                  const monthPercentage = project.monthlyHours && project.totalHours 
                    ? (project.monthlyHours / project.totalHours) * 100 
                    : 0;
                    
                  return (
                    <div key={project.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{project.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{formatTime(project.totalHours)}</Badge>
                          {project.monthlyHours && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(project.monthlyHours)} this month</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${monthPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TotalHoursView;
