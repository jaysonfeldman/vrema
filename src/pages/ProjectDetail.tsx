import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleCalendarEvent, Project } from '@/lib/types';
import { parseEventTitle, formatEventDate, calculateDuration } from '@/services/googleCalendarService';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import ActivityTag from '@/components/ActivityTag';
import { formatTime } from '@/lib/mock-data';
import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectStatus from '@/components/project/ProjectStatus';
import ProjectActivities from '@/components/project/ProjectActivities';
import EditProjectDialog from '@/components/project/EditProjectDialog';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    events, 
    customProjects, 
    syncCalendar,
    isLoading,
    lastSynced,
    getProjects,
    updateProject
  } = useCalendarSync();
  
  const [projectEvents, setProjectEvents] = useState<GoogleCalendarEvent[]>([]);
  const [project, setProject] = useState<Project | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<GoogleCalendarEvent[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('October 2023');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedProject, setEditedProject] = useState<Project | undefined>();
  
  useEffect(() => {
    if (!projectId) return;
    
    if (!customProjects || customProjects.length === 0) {
      if (!isLoading && !lastSynced) {
        console.log("No projects loaded yet, syncing calendar...");
        syncCalendar();
      }
      return;
    }
    
    const foundProject = customProjects.find(p => p.id === projectId);
    setProject(foundProject);
    setEditedProject(foundProject ? {...foundProject} : undefined);
    
    if (!foundProject) {
      toast({
        variant: "destructive",
        title: "Project not found",
        description: "The requested project could not be found."
      });
      return;
    }
    
    console.log(`Found project: "${foundProject.name}" with ID: ${foundProject.id}`);
  }, [projectId, customProjects, syncCalendar, isLoading, lastSynced]);
  
  useEffect(() => {
    if (!project || !events || events.length === 0) return;
    
    console.log(`Filtering events for project "${project.name}"`);
    
    const filteredEvents = events.filter(event => {
      if (!event.summary) return false;
      const { projectName } = parseEventTitle(event.summary);
      return projectName.toLowerCase() === project.name.toLowerCase();
    });
    
    console.log(`Found ${filteredEvents.length} events for project "${project.name}"`);
    setProjectEvents(filteredEvents);
    setFilteredEvents(filteredEvents);
  }, [events, project]);

  useEffect(() => {
    if (!projectEvents.length) return;
    
    let filtered = [...projectEvents];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.summary.toLowerCase().includes(term) || 
        (event.description && event.description.toLowerCase().includes(term))
      );
    }
    
    if (selectedActivity !== 'All') {
      filtered = filtered.filter(event => {
        const { activityType } = parseEventTitle(event.summary);
        return activityType === selectedActivity;
      });
    }
    
    setFilteredEvents(filtered);
  }, [projectEvents, searchTerm, selectedActivity]);

  const getUniqueActivityTypes = () => {
    const activityTypes = new Set<string>();
    activityTypes.add('All');
    
    projectEvents.forEach(event => {
      const { activityType } = parseEventTitle(event.summary);
      if (activityType) {
        activityTypes.add(activityType);
      }
    });
    
    return Array.from(activityTypes);
  };
  
  const calculateBillableHours = (totalHours: number): number => {
    return totalHours * 0.9;
  };

  const handleOpenEditDialog = () => {
    setEditedProject(project ? {...project} : undefined);
    setShowEditDialog(true);
  };
  
  const handleSaveProject = () => {
    if (editedProject) {
      updateProject(editedProject);
      setProject(editedProject);
      setShowEditDialog(false);
      toast({
        title: "Project updated",
        description: `Updated "${editedProject.name}" settings`
      });
    }
  };
  
  if (customProjects.length === 0 && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Loading Project...</h1>
          </div>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">
                Loading projects from calendar. Please wait...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Project Not Found</h1>
          </div>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">
                The project you're looking for doesn't exist or has been deleted.
              </p>
              <div className="flex justify-center mt-6">
                <Button onClick={() => navigate('/')}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalHours = project.totalHours;
  const budgetLeft = project.budgetHours ? project.budgetHours - totalHours : 0;
  const hourlyRate = project.hourlyRate || 95;
  const totalValue = Math.round(totalHours * hourlyRate);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="p-2 h-auto"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-1">back</span>
            </Button>
            
            <div>
              <h1 className="text-4xl font-bold">{project.name}</h1>
              {project.filterTerm && (
                <Badge variant="outline" className="bg-zinc-200 text-zinc-800 text-xs mt-1">
                  {project.filterTerm}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <Button variant="outline" className="h-10" onClick={handleOpenEditDialog}>
              <Edit className="h-4 w-4 mr-2" />
              Edit project
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="outline" className="h-10 bg-white">
            <Calendar className="h-4 w-4 mr-2" />
            {selectedMonth}
          </Button>
          
          <Button variant="outline" className="h-10 bg-white">
            All projects
          </Button>
          
          <Button variant="outline" className="h-10 bg-white">
            All activities
          </Button>
          
          <Button variant="outline" className="h-10 bg-white">
            <Users className="h-4 w-4 mr-2" />
            3 members
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 text-white md:col-span-1">
            <CardContent className="p-6">
              <p className="text-sm text-gray-400 mb-2">Total value</p>
              <p className="text-3xl font-mono font-bold text-green-400">€{totalValue}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 text-white md:col-span-1">
            <CardContent className="p-6">
              <p className="text-sm text-gray-400 mb-2">Hours logged</p>
              <p className="text-3xl font-mono font-bold">{formatTime(totalHours)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 text-white md:col-span-1">
            <CardContent className="p-6">
              <p className="text-sm text-gray-400 mb-2">Budget left</p>
              <p className="text-3xl font-mono font-bold text-amber-500">
                {formatTime(budgetLeft)}
                <span className="text-xs text-gray-500 ml-1 block">/this month</span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 text-white md:col-span-1">
            <CardContent className="p-6">
              <p className="text-sm text-gray-400 mb-2">Hourly rate</p>
              <p className="text-3xl font-mono font-bold">€{hourlyRate}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <p className="text-lg font-medium mb-4">Activities</p>
          <div className="flex flex-wrap gap-2">
            {project.activities
              .sort((a, b) => b.hours - a.hours)
              .map(activity => (
                <div key={activity.id} className="bg-green-500 text-white rounded-md px-3 py-1 text-sm">
                  {formatTime(activity.hours)} #{activity.type}
                </div>
              ))}
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Activity log</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Input
                    type="text"
                    placeholder="Search events..."
                    className="pl-3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select
                  value={selectedActivity}
                  onValueChange={setSelectedActivity}
                >
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUniqueActivityTypes().map((activity) => (
                      <SelectItem key={activity} value={activity}>
                        {activity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => syncCalendar()} 
                  disabled={isLoading}
                  className="whitespace-nowrap"
                >
                  {isLoading ? "Syncing..." : "Sync Calendar"}
                </Button>
              </div>
            </div>
            
            {filteredEvents.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>No events found for this project.</p>
                <p className="mt-2 text-sm">Try syncing your calendar or check the filters.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => {
                      const { activityType, description } = parseEventTitle(event.summary || '');
                      
                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Badge className="capitalize bg-slate-700 text-white">
                              {activityType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {description || '(No description)'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatEventDate(event.start?.dateTime || '')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {calculateDuration(
                                event.start?.dateTime || '', 
                                event.end?.dateTime || ''
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {editedProject && (
        <EditProjectDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          project={project}
          editedProject={editedProject}
          setEditedProject={setEditedProject}
          onSave={handleSaveProject}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
