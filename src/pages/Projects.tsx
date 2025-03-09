
import React from 'react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { projects } from '@/lib/mock-data';
import { Plus, Filter, ListFilter } from 'lucide-react';

const Projects: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Projects</h1>
          
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              <ListFilter className="w-4 h-4" />
              <span>Sort</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-black text-white rounded-md px-4 py-2 hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
