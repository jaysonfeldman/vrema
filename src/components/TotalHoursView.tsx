import React, { useMemo } from 'react';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import { formatHours, getDateRange } from '@/lib/eventStats';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AvatarGroup } from './ui/avatar-group';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function TotalHoursView() {
  const { activityColors, filters, updateFilters } = useSharedState();
  const { filteredProjects, allProjects } = useProjectStats();

  const { startDate: rangeStart, endDate: rangeEnd } = useMemo(
    () => getDateRange(filters.dateRange),
    [filters.dateRange]
  );

  // Filter projects and activities based on selected filters
  const filteredData = useMemo(() => {
    let projects = [...filteredProjects];

    if (filters.project !== 'All') {
      projects = projects.filter((project) => project.id === filters.project);
    }

    if (filters.activity !== 'All') {
      projects = projects.map((project) => ({
        ...project,
        activities: project.activities.filter(
          (activity) => activity.type.toLowerCase() === filters.activity.toLowerCase()
        ),
      }));
    }

    return projects.map((project) => ({
      ...project,
      totalHours: project.activities.reduce((sum, activity) => sum + activity.hours, 0),
    }));
  }, [filteredProjects, filters.project, filters.activity]);

  // Calculate total hours and merged activities
  const totalHours = filteredData.reduce((sum, project) => sum + project.totalHours, 0);
  const mergedActivities = filteredData
    .flatMap(project => project.activities)
    .reduce((acc, activity) => {
      const existing = acc.find(a => a.type === activity.type);
      if (existing) {
        existing.hours += activity.hours;
      } else {
        acc.push({ ...activity });
      }
      return acc;
    }, [] as typeof filteredData[0]['activities']);

  // Sort activities by hours (highest to lowest)
  const sortedActivities = [...mergedActivities].sort((a, b) => b.hours - a.hours);

  // Get activity color from shared state
  const getActivityColor = (type: string): string => {
    const activityColor = activityColors.find(ac => ac.type.toLowerCase() === type.toLowerCase());
    if (activityColor) return activityColor.color;
    return '#D1D5DC'; // Default color for unknown activities
  };

  // Format date range display
  const getDateRangeDisplay = () => {
    switch (filters.dateRange) {
      case 'day':
        return rangeStart.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric'
        });
      case 'week':
        return `${rangeStart.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric'
        })} - ${rangeEnd.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric'
        })}`;
      case 'month':
        return rangeStart.toLocaleDateString('en-GB', {
          month: 'long',
          year: 'numeric'
        });
      case 'year':
        return rangeStart.getFullYear().toString();
      default:
        return 'All time';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={filters.dateRange} onValueChange={(value: any) => updateFilters({ dateRange: value })}>
            <SelectTrigger className="w-[220px] bg-white border-zinc-200">
              <div className="flex items-center justify-between w-full">
                <SelectValue placeholder="Select time range" />
                <span className="text-sm text-zinc-400 ml-2">{getDateRangeDisplay()}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.project} onValueChange={(value) => updateFilters({ project: value })}>
            <SelectTrigger className="w-[180px] bg-white border-zinc-200">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All projects</SelectItem>
              {allProjects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.activity} onValueChange={(value) => updateFilters({ activity: value })}>
            <SelectTrigger className="w-[180px] bg-white border-zinc-200">
              <SelectValue placeholder="All activities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All activities</SelectItem>
              {Array.from(new Set(allProjects.flatMap(p => p.activities.map(a => a.type)))).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 bg-white border border-zinc-200 rounded-md h-10">
            <div className="flex items-center px-3">
              <AvatarGroup>
                {Array.from(new Set(filteredData.flatMap(p => p.teamMembers).map(member => member.id)))
                  .map(memberId => {
                    const member = filteredData.flatMap(p => p.teamMembers).find(m => m.id === memberId);
                    return (
                      <Avatar key={memberId} className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={member?.imageUrl} />
                        <AvatarFallback>{member?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    );
                  })}
              </AvatarGroup>
              <span className="text-sm text-zinc-600 ml-2">
                {Array.from(new Set(filteredData.flatMap(p => p.teamMembers).map(member => member.id))).length} members
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" className="border-zinc-200">
            Export hours
          </Button>
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
            Create invoice
          </Button>
        </div>
      </div>

      {/* Total Hours Card */}
      <div className="bg-[#272729] rounded-lg p-6 text-white">
        <div className="flex items-start space-x-12">
          <div>
            <p className="text-sm text-zinc-400 mb-2">Total hours</p>
            <p className="text-5xl font-mono font-bold">{formatHours(totalHours)}</p>
          </div>

          <div className="flex-1">
            <p className="text-sm text-zinc-400 mb-2">Activities</p>
            <div className="h-2 bg-zinc-800 rounded-full mb-2 overflow-hidden">
              {sortedActivities.map((activity) => {
                const widthPercent = (activity.hours / totalHours) * 100;
                return (
                  <div 
                    key={activity.id}
                    className="h-full float-left"
                    style={{ 
                      width: `${widthPercent}%`,
                      backgroundColor: getActivityColor(activity.type)
                    }}
                  />
                );
              })}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {sortedActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center space-x-1 px-2 py-1 rounded text-xs text-black"
                  style={{ backgroundColor: getActivityColor(activity.type) }}
                >
                  <span className="font-mono">{formatHours(activity.hours)}</span>
                  <span>#{activity.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
