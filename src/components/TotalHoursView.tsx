
import React, { useEffect, useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card } from '@/components/ui/card';
import TotalHoursCard from './TotalHoursCard';
import { Activity } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';

const TotalHoursView: React.FC = () => {
  const { 
    getTotalHours, 
    getActivityHours, 
    filters, 
    updateFilters,
    events,
    filteredEvents,
    lastSynced,
    syncCalendar,
    isAuthenticated,
    getActivitiesFromEvents,
    customProjects,
    getProjects
  } = useCalendarSync();
  
  const [titleFilter, setTitleFilter] = useState('');
  const [debouncedTitleFilter, setDebouncedTitleFilter] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [selectedActivity, setSelectedActivity] = useState<string>('All');
  const [month, setMonth] = useState('October 2023');
  
  // For debouncing the title filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
      if (titleFilter !== '') {
        updateFilters({ searchTerm: titleFilter });
        syncCalendar();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [titleFilter, updateFilters, syncCalendar]);
  
  // Force recalculation on component mount and when events change
  useEffect(() => {
    if (isAuthenticated && events.length === 0 && !lastSynced) {
      console.log("No events found, triggering calendar sync...");
      syncCalendar();
    }
  }, [isAuthenticated, events.length, lastSynced, syncCalendar]);
  
  // Get activities when filtered events change
  useEffect(() => {
    if (filteredEvents.length > 0) {
      const fetchedActivities = getActivitiesFromEvents(filteredEvents);
      console.log("Fetched activities:", fetchedActivities);
      setActivities(fetchedActivities);
    }
  }, [filteredEvents, getActivitiesFromEvents]);

  // Apply project filter 
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    updateFilters({ project: value });
    syncCalendar();
  };

  // Apply activity filter
  const handleActivityChange = (value: string) => {
    setSelectedActivity(value);
    updateFilters({ activity: value });
    syncCalendar();
  };
  
  const totalHours = getTotalHours();
  
  // Format time to hours and minutes
  const formatTime = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${String(minutes).padStart(2, '0')}`;
  };
  
  // Apply date range change and trigger re-sync
  const handleDateRangeChange = (value: string) => {
    const days = parseInt(value);
    console.log(`Changing date range to ${days} days`);
    updateFilters({ dateRange: days });
    syncCalendar(days);
  };

  // Get all unique activities
  const getAllActivities = () => {
    const activitySet = new Set<string>();
    activitySet.add('All');
    
    activities.forEach(activity => {
      activitySet.add(activity.type);
    });
    
    return Array.from(activitySet);
  };

  const projects = getProjects();
  const allActivities = getAllActivities();
  
  // Generate unique member list from all projects
  const getAllMembers = () => {
    const members = new Set();
    customProjects.forEach(project => {
      project.teamMembers.forEach(member => {
        members.add(member);
      });
    });
    return Array.from(members);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex items-center">
          <Button variant="outline" className="bg-white mr-2">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{month}</span>
          </Button>
          
          <Select
            value={selectedProject}
            onValueChange={handleProjectChange}
          >
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project} value={project}>{project}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedActivity}
            onValueChange={handleActivityChange}
            className="ml-2"
          >
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="All activities" />
            </SelectTrigger>
            <SelectContent>
              {allActivities.map(activity => (
                <SelectItem key={activity} value={activity}>{activity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white">
            Export hours
          </Button>
          <Button className="bg-zinc-900">
            Create invoice
          </Button>
        </div>
      </div>
      
      {/* Main Total Hours Card */}
      <Card className="bg-zinc-900 text-white border-0">
        <TotalHoursCard
          totalHours={totalHours}
          formatTime={formatTime}
          dateRange={filters.dateRange}
          lastSynced={lastSynced}
          getActivityHours={getActivityHours}
          activities={activities}
        />
      </Card>
    </div>
  );
};

export default TotalHoursView;
