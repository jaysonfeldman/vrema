
import React, { useEffect, useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import ActivityTag from './ActivityTag';
import { Clock, Calendar, Search, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
    isAuthenticated
  } = useCalendarSync();
  
  // Title filter state
  const [titleFilter, setTitleFilter] = useState('');
  const [debouncedTitleFilter, setDebouncedTitleFilter] = useState('');
  
  // For debouncing the title filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
      // Apply the filter when typing stops
      if (titleFilter !== '') {
        updateFilters({ titleFilter: titleFilter });
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
  
  const totalHours = getTotalHours();
  console.log("TotalHoursView rendering with total hours:", totalHours);
  console.log("Filtered events count:", filteredEvents.length);
  
  // Format time to hours and minutes
  const formatTime = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${String(minutes).padStart(2, '0')}`;
  };
  
  // Calculate hours by activity type
  const activityTypes: { type: 'design' | 'strategy' | 'dev' | 'meetings' | 'admin', label: string }[] = [
    { type: 'design', label: 'Design' },
    { type: 'strategy', label: 'Strategy' },
    { type: 'dev', label: 'Development' },
    { type: 'meetings', label: 'Meetings' },
    { type: 'admin', label: 'Admin' }
  ];
  
  // Apply date range change and trigger re-sync
  const handleDateRangeChange = (value: string) => {
    const days = parseInt(value);
    console.log(`Changing date range to ${days} days`);
    updateFilters({ dateRange: days });
    syncCalendar(days);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Total hours</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Filter by title" 
              className="pl-9 w-[200px]"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
            />
          </div>

          <Select
            value={filters.dateRange.toString()}
            onValueChange={handleDateRangeChange}
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
      
      {/* Main Total Hours Card */}
      <Card className="bg-gray-900 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between gap-6">
            {/* Total hours display */}
            <div className="flex flex-col">
              <div className="text-gray-400 text-sm mb-1">Total hours</div>
              <div className="text-4xl font-bold mb-2">{formatTime(totalHours)}</div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {filters.dateRange === 30 ? 'Last 30 days' : 
                   filters.dateRange === 7 ? 'Last week' : 
                   filters.dateRange === 90 ? 'Last 3 months' : 
                   `Last ${filters.dateRange} days`}
                </span>
                {lastSynced && (
                  <Badge variant="outline" className="bg-transparent border-gray-700 text-gray-300 ml-2">
                    Last synced: {format(lastSynced, 'MMM d, h:mm a')}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Activities */}
            <div className="flex-1">
              <div className="text-gray-400 text-sm mb-3">Activities</div>
              <div className="space-y-4">
                {activityTypes.map(activity => {
                  const hours = getActivityHours(activity.type);
                  const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
                  
                  return (
                    <div key={activity.type}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: 
                                activity.type === 'design' ? 'rgb(34, 197, 94)' :
                                activity.type === 'strategy' ? 'rgb(59, 130, 246)' :
                                activity.type === 'dev' ? 'rgb(168, 85, 247)' :
                                activity.type === 'meetings' ? 'rgb(234, 179, 8)' :
                                'rgb(239, 68, 68)'
                            }}
                          />
                          <span className="text-sm">{activity.label}</span>
                        </div>
                        <span className="text-sm font-medium">{formatTime(hours)}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TotalHoursView;
