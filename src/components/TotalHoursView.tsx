import React, { useEffect, useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card } from '@/components/ui/card';
import TotalHoursCard from './TotalHoursCard';
import { Activity } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from './ui/button';
import { Calendar, Download, FileText, BarChart } from 'lucide-react';

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
    activitySet.add('All');
    
    activities.forEach(activity => {
      activitySet.add(activity.type);
    });
    
    return Array.from(activitySet);
  };

  const projects = getProjects();
  const allActivities = getAllActivities();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex items-center">
          <Select
            value={filters.dateRange === 30 ? 'current' : filters.dateRange === 60 ? 'previous' : 'all'}
            onValueChange={(value) => {
              const days = value === 'current' ? 30 : value === 'previous' ? 60 : 365;
              handleDateRangeChange(days.toString());
            }}
          >
            <SelectTrigger className="w-[150px] bg-white">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="This Month" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {monthViewOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedProject}
            onValueChange={handleProjectChange}
          >
            <SelectTrigger className="w-[150px] bg-white ml-2">
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
            <SelectTrigger className="w-[150px] bg-white ml-2">
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
            <Download className="h-4 w-4 mr-2" />
            Export hours
          </Button>
          <Button variant="outline" className="bg-white">
            <BarChart className="h-4 w-4 mr-2" />
            View reports
          </Button>
          <Button className="bg-zinc-900">
            <FileText className="h-4 w-4 mr-2" />
            Create invoice
          </Button>
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
