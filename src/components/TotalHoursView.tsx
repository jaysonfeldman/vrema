
import React, { useEffect, useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card } from '@/components/ui/card';
import TotalHoursFilter from './TotalHoursFilter';
import TotalHoursCard from './TotalHoursCard';
import { Activity } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronDown, Filter } from 'lucide-react';
import { Button } from './ui/button';

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
  
  // Title filter state
  const [titleFilter, setTitleFilter] = useState('');
  const [debouncedTitleFilter, setDebouncedTitleFilter] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [selectedActivity, setSelectedActivity] = useState<string>('All');
  
  // For debouncing the title filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
      // Apply the filter when typing stops
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
    // We need to modify the useCalendarSync hook to support activity filtering
    // This is a placeholder for now
    updateFilters({ activity: value });
    syncCalendar();
  };
  
  const totalHours = getTotalHours();
  console.log("TotalHoursView rendering with total hours:", totalHours);
  console.log("Filtered events count:", filteredEvents.length);
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <h2 className="text-2xl font-bold">Total hours</h2>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center rounded-md border px-3 py-2 bg-white">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">October 2023</span>
          </div>
          
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
          
          <Button variant="outline" className="bg-white">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filter</span>
          </Button>
        </div>
      </div>
      
      {/* Main Total Hours Card */}
      <Card className="bg-gray-900 text-white border-0">
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
