
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Plus, Filter, X } from 'lucide-react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { toast } from '@/components/ui/use-toast';
import ActivityTag from './ActivityTag';
import { ActivityType } from '@/lib/types';

const CalendarProjectsList: React.FC = () => {
  const { 
    projectStats, 
    isAuthenticated, 
    events, 
    getTotalHours,
    addProjectFilter,
    projectFilters,
    removeProjectFilter,
    customProjects,
    syncCalendar
  } = useCalendarSync();
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFilter, setNewProjectFilter] = useState('');
  
  // For debugging custom projects
  useEffect(() => {
    console.log("CalendarProjectsList - customProjects updated:", customProjects);
  }, [customProjects]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  // Calculate the total hours for progress bar percentages
  const totalProjectHours = Object.values(projectStats.projectMap).reduce((sum, hours) => sum + hours, 0);
  
  const handleAddProject = () => {
    if (newProjectName && newProjectFilter) {
      console.log("Dashboard: Adding new project filter:", newProjectName, newProjectFilter);
      addProjectFilter(newProjectName.trim(), newProjectFilter.trim());
      
      // Trigger a sync to update projects immediately
      syncCalendar();
      
      toast({
        title: "Project view created",
        description: `Created "${newProjectName}" view for events containing "${newProjectFilter}"`,
      });
      setNewProjectName('');
      setNewProjectFilter('');
      setShowAddProject(false);
    }
  };
  
  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects Overview</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="font-normal">
            {events.length} events tracked
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddProject(!showAddProject)}
          >
            {showAddProject ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showAddProject ? 'Cancel' : 'Add Project View'}
          </Button>
        </div>
      </div>
      
      {showAddProject && (
        <Card className="bg-muted/50 mb-4">
          <CardContent className="pt-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Project Name</label>
                <Input 
                  placeholder="e.g., Marketing Project" 
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Title Filter (matches events containing this text)</label>
                <Input 
                  placeholder="e.g., Marketing" 
                  value={newProjectFilter}
                  onChange={e => setNewProjectFilter(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will create a view of all events with titles containing this text
                </p>
              </div>
              <Button 
                onClick={handleAddProject}
                disabled={!newProjectName || !newProjectFilter}
              >
                Create Project View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Custom Project Cards */}
      {customProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {customProjects.map(project => (
            <Card key={project.id} className="overflow-hidden bg-gray-900 text-white border-0">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{project.name}</CardTitle>
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-transparent text-white border-gray-600">
                      {Math.round(project.totalHours * 10) / 10}h
                    </Badge>
                    {project.budgetHours && (
                      <span className="text-xs text-gray-400 mt-1">
                        Budget: {project.budgetHours}h
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Time logged</span>
                    <span>
                      {project.budgetHours && project.totalHours > project.budgetHours 
                        ? `-${Math.round((project.totalHours - project.budgetHours) * 10) / 10}h` 
                        : `${Math.round((project.budgetHours ? project.budgetHours - project.totalHours : 0) * 10) / 10}h left`}
                    </span>
                  </div>
                  <Progress 
                    value={(project.totalHours / (project.budgetHours || 100)) * 100} 
                    className="h-1.5 mb-4" 
                    indicatorClassName={project.totalHours > (project.budgetHours || 0) ? "bg-red-500" : undefined}
                  />
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-2">Activities</div>
                  <div className="flex flex-wrap gap-1">
                    {project.activities.map((activity, index) => (
                      <ActivityTag 
                        key={index} 
                        type={activity.type as ActivityType} 
                        hours={Math.round(activity.hours * 10) / 10} 
                        className="text-xs px-2 py-0.5"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900 text-white p-8 text-center">
          <div className="py-6">
            <h3 className="text-lg font-medium mb-2">No project views created yet</h3>
            <p className="text-gray-400">
              Create a custom project view to filter your calendar events
            </p>
          </div>
        </Card>
      )}
      
      {/* Default Calendar Projects */}
      {Object.keys(projectStats.projectMap).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(projectStats.projectMap)
            .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
            .map(([projectName, hours]) => {
              const percentage = (hours / totalProjectHours) * 100;
              
              return (
                <Card key={projectName} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{projectName}</CardTitle>
                      <Badge variant="outline">{Math.round(hours * 10) / 10}h</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={percentage} className="h-2 mb-4" />
                    <div className="flex flex-wrap gap-2">
                      {projectStats.activityMap[projectName]?.map((activity, index) => (
                        <ActivityTag 
                          key={index} 
                          type={activity.type as ActivityType} 
                          hours={Math.round(activity.hours * 10) / 10} 
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default CalendarProjectsList;
