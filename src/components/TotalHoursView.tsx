
import React, { useEffect, useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card } from '@/components/ui/card';
import TotalHoursFilter from './TotalHoursFilter';
import TotalHoursCard from './TotalHoursCard';

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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Total hours</h2>
        <TotalHoursFilter 
          dateRange={filters.dateRange}
          onDateRangeChange={handleDateRangeChange}
          titleFilter={titleFilter}
          onTitleFilterChange={setTitleFilter}
        />
      </div>
      
      {/* Main Total Hours Card */}
      <Card className="bg-gray-900 text-white border-0">
        <TotalHoursCard
          totalHours={totalHours}
          formatTime={formatTime}
          dateRange={filters.dateRange}
          lastSynced={lastSynced}
          getActivityHours={getActivityHours}
        />
      </Card>
    </div>
  );
};

export default TotalHoursView;
