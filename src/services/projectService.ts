
import { supabase } from '@/integrations/supabase/client';
import { Project, Activity } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    // Fetch projects
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return [];
    }

    // Fetch activities for all projects
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*');

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return [];
    }

    // Map database records to our Project type
    const projects: Project[] = projectsData.map(project => {
      // Find activities for this project
      const projectActivities = activitiesData
        .filter(activity => activity.project_id === project.id)
        .map(activity => ({
          id: activity.id,
          type: activity.type,
          hours: activity.hours,
          hidden: activity.hidden,
          date: new Date(activity.created_at)
        }));

      return {
        id: project.id,
        name: project.name,
        totalHours: project.total_hours,
        budgetHours: project.budget_hours,
        hourlyRate: project.hourly_rate,
        activities: projectActivities,
        teamMembers: [], // Default empty array since we don't have team members yet
        monthlyHours: project.monthly_hours,
        filterTerm: project.filter_term,
        visible: project.visible
      };
    });

    return projects;
  } catch (error) {
    console.error('Error in fetchProjects:', error);
    return [];
  }
};

export const saveProject = async (project: Project): Promise<{ success: boolean, project?: Project, error?: any }> => {
  try {
    // Prepare project data for Supabase
    const projectData = {
      id: project.id,
      name: project.name,
      budget_hours: project.budgetHours,
      hourly_rate: project.hourlyRate,
      total_hours: project.totalHours,
      monthly_hours: project.monthlyHours,
      filter_term: project.filterTerm,
      visible: project.visible !== false
    };

    // Insert or update project
    const { data, error } = await supabase
      .from('projects')
      .upsert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error saving project:', error);
      return { success: false, error };
    }

    // Now handle activities
    if (project.activities && project.activities.length > 0) {
      for (const activity of project.activities) {
        // For new activities without proper UUID
        const activityId = activity.id.startsWith('activity-') || activity.id.startsWith('new-') 
          ? uuidv4() 
          : activity.id;

        // Prepare activity data
        const activityData = {
          id: activityId,
          project_id: data.id,
          type: activity.type,
          hours: activity.hours,
          hidden: activity.hidden || false
        };

        // Insert or update activity
        const { error: activityError } = await supabase
          .from('activities')
          .upsert(activityData);

        if (activityError) {
          console.error('Error saving activity:', activityError);
          // Continue with other activities even if one fails
        }
      }
    }

    // Return the saved project with updated data
    return {
      success: true,
      project: {
        ...project,
        id: data.id
      }
    };
  } catch (error) {
    console.error('Error in saveProject:', error);
    return { success: false, error };
  }
};

export const deleteProject = async (projectId: string): Promise<{ success: boolean, error?: any }> => {
  try {
    // Delete project (associated activities will be deleted by cascade)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteProject:', error);
    return { success: false, error };
  }
};
