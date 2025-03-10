
import React, { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import Timeline from './Timeline';
import ActivityTag from './ActivityTag';
import { Calendar, FileDown, FileUp } from 'lucide-react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { formatTime } from '@/lib/mock-data';
import { Project } from '@/lib/types';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { 
    customProjects, 
    getTotalHours, 
    getActivityHours,
    getProjects,
    updateProject
  } = useCalendarSync();
  
  useEffect(() => {
    // Add animation delay for a staggered effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Implement the required handlers for ProjectCard
  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      updateProject(updatedProject);
      toast.success("Project updated successfully");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      // Since we don't have direct access to delete functionality in this component,
      // we'll mock it with a toast notification
      toast.success(`Project deleted (ID: ${projectId})`);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Projects Section */}
      <section className={`mb-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              add project
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              all projects
            </button>
            <div className="flex items-center text-sm text-gray-600 border rounded-md px-3 py-1.5 hover:border-gray-400 transition-colors">
              <span>Sort by Most tracked hours</span>
              <svg className="ml-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="flex items-center space-x-1 border rounded-md px-3 py-1.5 hover:border-gray-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="text-sm">Cards</span>
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          ))}
        </div>
      </section>
      
      {/* Summary & Filter Section */}
      <section className={`mb-12 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <button className="flex items-center space-x-2 bg-white text-gray-800 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-white text-gray-800 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
            <span>All projects</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-white text-gray-800 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
            <span>All activities</span>
          </button>
          
          <div className="ml-auto flex space-x-3">
            <button className="flex items-center space-x-2 text-gray-800 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
              <FileDown className="w-4 h-4" />
              <span>Export hours</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-gray-900 text-white rounded-md px-4 py-2 hover:bg-gray-800 transition-colors">
              <FileUp className="w-4 h-4" />
              <span>Create invoice</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Total Hours */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-slide-right" style={{ animationDelay: '300ms' }}>
            <h3 className="text-xl font-semibold mb-4">Total hours</h3>
            <div className="time-display mb-6">{formatTime(getTotalHours())}</div>
            
            <div className="space-y-3">
              <ActivityTag type="design" hours={getActivityHours('design')} className="mr-2 mb-2" />
              <ActivityTag type="strategy" hours={getActivityHours('strategy')} className="mr-2 mb-2" />
              <ActivityTag type="meetings" hours={getActivityHours('meetings')} className="mr-2 mb-2" />
              <ActivityTag type="dev" hours={getActivityHours('dev')} className="mr-2 mb-2" />
              <ActivityTag type="admin" hours={getActivityHours('admin')} className="mr-2 mb-2" />
            </div>
          </div>
          
          {/* Progress Bar Chart (simplified) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-slide-right" style={{ animationDelay: '400ms' }}>
            <h3 className="text-xl font-semibold mb-6">Activity breakdown</h3>
            
            <div className="space-y-6">
              {['design', 'strategy', 'dev', 'meetings', 'admin'].map((type, index) => {
                const hours = getActivityHours(type as any);
                const totalHours = getTotalHours();
                const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">#{type}</span>
                      <span className="text-sm font-mono">{formatTime(hours)}</span>
                    </div>
                    <div className="progress-bar bg-gray-100">
                      <div 
                        className={`progress-bar-fill ${
                          type === 'design' ? 'bg-design' : 
                          type === 'strategy' ? 'bg-strategy' : 
                          type === 'dev' ? 'bg-dev' : 
                          type === 'meetings' ? 'bg-meetings' : 
                          'bg-admin'
                        }`}
                        style={{ 
                          width: `${percentage}%`,
                          transitionDelay: `${index * 100 + 500}ms`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
