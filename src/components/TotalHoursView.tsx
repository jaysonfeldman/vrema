
import React, { useEffect, useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card } from '@/components/ui/card';
import TotalHoursCard from './TotalHoursCard';
import { Activity } from '@/lib/types';
import { Button } from './ui/button';
import { Calendar, Check, ChevronDown, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

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
  const [monthViewOptions] = useState([
    { label: 'This Month', value: 'current' },
    { label: 'Last Month', value: 'previous' },
    { label: 'All Time', value: 'all' }
  ]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
      if (titleFilter !== '') {
        updateFilters({ searchTerm: titleFilter });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [titleFilter, updateFilters]);
  
  useEffect(() => {
    if (isAuthenticated && events.length === 0 && !lastSynced) {
      console.log("No events found, triggering calendar sync...");
      syncCalendar();
    }
  }, [isAuthenticated, events.length, lastSynced, syncCalendar]);
  
  useEffect(() => {
    if (filteredEvents.length > 0) {
      const fetchedActivities = getActivitiesFromEvents(filteredEvents);
      console.log("Fetched activities:", fetchedActivities);
      setActivities(fetchedActivities);
    } else {
      if (events.length > 0) {
        const allActivities = getActivitiesFromEvents(events);
        console.log("Using activities from all events:", allActivities);
        setActivities(allActivities);
      }
    }
  }, [filteredEvents, events, getActivitiesFromEvents]);

  // Initial setup to select all projects except "Other" by default
  useEffect(() => {
    const projects = getProjects();
    if (projects.length > 0) {
      // Filter out "Other" and "All" from the default selection
      const defaultSelected = projects.filter(p => p !== 'Other' && p !== 'All');
      if (defaultSelected.length > 0) {
        updateFilters({ 
          project: defaultSelected.length === 1 ? defaultSelected[0] : 'All',
          selectedProjects: defaultSelected 
        });
      }
    }
  }, [getProjects, updateFilters]);

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    updateFilters({ project: value });
  };

  const handleActivityChange = (value: string) => {
    setSelectedActivity(value);
    updateFilters({ activity: value });
  };
  
  const totalHours = getTotalHours();
  
  const formatTime = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${String(minutes).padStart(2, '0')}`;
  };
  
  const handleDateRangeChange = (value: string) => {
    const days = parseInt(value);
    console.log(`Changing date range to ${days} days`);
    updateFilters({ dateRange: days });
    syncCalendar(days);
  };

  const getAllActivities = () => {
    const activitySet = new Set<string>();
    
    activities.forEach(activity => {
      activitySet.add(activity.type);
    });
    
    return Array.from(activitySet);
  };

  const toggleProjectSelection = (projectName: string) => {
    const currentSelected = filters.selectedProjects || [];
    
    if (currentSelected.includes(projectName)) {
      // Remove project from selection
      const newSelection = currentSelected.filter(p => p !== projectName);
      updateFilters({ 
        selectedProjects: newSelection,
        project: newSelection.length === 1 ? newSelection[0] : 'All'
      });
    } else {
      // Add project to selection
      const newSelection = [...currentSelected, projectName];
      updateFilters({ 
        selectedProjects: newSelection,
        project: newSelection.length === 1 ? newSelection[0] : 'All'
      });
    }
  };

  const toggleActivitySelection = (activityType: string) => {
    const currentSelected = filters.selectedActivities || [];
    
    if (currentSelected.includes(activityType)) {
      // Remove activity from selection
      const newSelection = currentSelected.filter(a => a !== activityType);
      updateFilters({ 
        selectedActivities: newSelection.length > 0 ? newSelection : undefined,
        activity: newSelection.length === 1 ? newSelection[0] : 'All'
      });
    } else {
      // Add activity to selection
      const newSelection = [...currentSelected, activityType];
      updateFilters({ 
        selectedActivities: newSelection,
        activity: newSelection.length === 1 ? newSelection[0] : 'All'
      });
    }
  };

  const projects = getProjects();
  const allActivities = getAllActivities();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white mr-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{filters.dateRange === 30 ? 'This Month' : filters.dateRange === 60 ? 'Last Month' : 'All Time'}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="p-2">
                {monthViewOptions.map(option => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      const days = option.value === 'current' ? 30 : option.value === 'previous' ? 60 : 365;
                      handleDateRangeChange(days.toString());
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white mr-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Projects</span>
                {filters.selectedProjects && filters.selectedProjects.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.selectedProjects.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <div className="py-2 px-3 border-b">
                <h4 className="font-medium text-sm">Select Projects</h4>
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {projects.filter(p => p !== 'All').map(project => (
                  <div key={project} className="flex items-center py-2 px-2 hover:bg-gray-100 rounded-md">
                    <Checkbox 
                      id={`project-${project}`}
                      checked={filters.selectedProjects?.includes(project) || false}
                      onCheckedChange={() => toggleProjectSelection(project)}
                      className="mr-2"
                    />
                    <label htmlFor={`project-${project}`} className="flex-1 cursor-pointer text-sm">
                      {project}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Activities</span>
                {filters.selectedActivities && filters.selectedActivities.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.selectedActivities.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <div className="py-2 px-3 border-b">
                <h4 className="font-medium text-sm">Select Activities</h4>
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {allActivities.map(activity => (
                  <div key={activity} className="flex items-center py-2 px-2 hover:bg-gray-100 rounded-md">
                    <Checkbox 
                      id={`activity-${activity}`}
                      checked={filters.selectedActivities?.includes(activity) || false}
                      onCheckedChange={() => toggleActivitySelection(activity)}
                      className="mr-2"
                    />
                    <label htmlFor={`activity-${activity}`} className="flex-1 cursor-pointer text-sm">
                      {activity}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
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
