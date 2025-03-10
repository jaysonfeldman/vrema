
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Project, GoogleCalendarEvent } from '@/lib/types';
import Header from '@/components/Header';
import { useToast } from '@/components/ui/use-toast';
import EditProjectDialog from '@/components/project/EditProjectDialog';
import ProjectsLoading from '@/components/project/ProjectsLoading';
import ProjectDetailHeader from '@/components/project/ProjectDetailHeader';
import ProjectStatsCards from '@/components/project/ProjectStatsCards';
import ProjectEventsCard from '@/components/project/ProjectEventsCard';
import { supabase } from '@/integrations/supabase/client';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isLoading: syncLoading, 
    customProjects,
    syncCalendar,
    updateProject,
    getProjectById,
    getProjectEvents,
    events,
  } = useCalendarSync();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectEvents, setProjectEvents] = useState<GoogleCalendarEvent[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load project and filter events
  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    console.log("ProjectDetail: Loading project with ID:", projectId);
    setIsLoading(true);
    
    // Try to get project from Supabase first
    const fetchProjectFromSupabase = async () => {
      try {
        const { data: projectData, error } = await supabase
          .from('projects')
          .select(`
            *,
            activities(*)
          `)
          .eq('id', projectId)
          .single();
          
        if (error) {
          console.error('Error fetching project from Supabase:', error);
          // Fallback to local data
          const localProject = getProjectById(projectId);
          if (localProject) {
            setProject(localProject);
            const projectEvents = getProjectEvents(projectId);
            setProjectEvents(projectEvents);
          } else {
            console.error('Project not found with ID:', projectId);
            toast({
              title: "Project not found",
              description: "The requested project could not be found.",
              variant: "destructive"
            });
            navigate('/');
          }
        } else if (projectData) {
          console.log('Project fetched from Supabase:', projectData);
          
          // Convert Supabase project to app Project format
          const formattedProject: Project = {
            id: projectData.id,
            name: projectData.name,
            totalHours: parseFloat(projectData.total_hours.toString()),
            budgetHours: projectData.budget_hours ? parseFloat(projectData.budget_hours.toString()) : undefined,
            hourlyRate: projectData.hourly_rate ? parseFloat(projectData.hourly_rate.toString()) : undefined,
            filterTerm: projectData.filter_term,
            monthlyHours: projectData.monthly_hours ? parseFloat(projectData.monthly_hours.toString()) : 0,
            visible: projectData.visible,
            activities: projectData.activities.map((activity: any) => ({
              id: activity.id,
              type: activity.type,
              hours: parseFloat(activity.hours.toString()),
              date: new Date()
            })),
            teamMembers: [],
            color: '#222222' // Default dark color
          };
          
          setProject(formattedProject);
          
          // Get events for this project
          const eventsForProject = getProjectEvents(projectId);
          setProjectEvents(eventsForProject);
        }
      } catch (error) {
        console.error('Error in fetchProjectFromSupabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectFromSupabase();
    
    // Force a calendar sync to ensure we have the latest data
    syncCalendar(90); // Get 3 months of data
  }, [projectId, getProjectById, getProjectEvents, navigate, syncCalendar, toast]);
  
  // Update project events when events change
  useEffect(() => {
    if (projectId && events.length > 0) {
      const projectEvents = events.filter(event => {
        // Check if event has projectId property matching this project
        if ('projectId' in event && event.projectId === projectId) {
          return true;
        }
        
        // If project is loaded, check by name or filter term
        if (project) {
          const eventSummary = event.summary?.toLowerCase() || '';
          const projectName = project.name.toLowerCase();
          const filterTerm = project.filterTerm?.toLowerCase();
          
          return eventSummary.includes(projectName) || 
                (filterTerm && eventSummary.includes(filterTerm));
        }
        
        return false;
      });
      
      setProjectEvents(projectEvents);
    }
  }, [events, projectId, project]);

  // Handle project update
  const handleProjectUpdate = (updatedProject: Project) => {
    setShowEditDialog(false);
    if (project) {
      updateProject(updatedProject);
      setProject(updatedProject);
      
      // Update project in Supabase
      supabase
        .from('projects')
        .update({
          name: updatedProject.name,
          total_hours: updatedProject.totalHours,  // Convert to number directly
          budget_hours: updatedProject.budgetHours || null,  // Use null for undefined values
          hourly_rate: updatedProject.hourlyRate || null,    // Use null for undefined values
          filter_term: updatedProject.filterTerm,
          monthly_hours: updatedProject.monthlyHours || 0,   // Default to 0 if undefined
          visible: updatedProject.visible
        })
        .eq('id', updatedProject.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating project in Supabase:', error);
          }
        });
      
      toast({
        title: "Project updated",
        description: "Project details have been updated successfully."
      });
    }
  };
  
  if (isLoading || syncLoading) {
    return <ProjectsLoading />;
  }
  
  if (!project) {
    return <ProjectsLoading />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <ProjectDetailHeader 
          projectName={project.name}
          onEditClick={() => setShowEditDialog(true)}
        />
        
        <ProjectStatsCards 
          project={project} 
          projectEvents={projectEvents}
          syncCalendar={syncCalendar}
        />
        
        <ProjectEventsCard 
          projectEvents={projectEvents}
          syncCalendar={syncCalendar}
        />
      </div>

      {showEditDialog && (
        <EditProjectDialog
          project={project}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={handleProjectUpdate}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
