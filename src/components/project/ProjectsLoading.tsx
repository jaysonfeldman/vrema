
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';

const ProjectsLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-[100px] mr-4" />
          <Skeleton className="h-8 w-[180px]" />
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    </div>
  );
};

export default ProjectsLoading;
