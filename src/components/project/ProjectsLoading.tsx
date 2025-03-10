
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ProjectsLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-[100px] mr-4" />
          <Skeleton className="h-8 w-[180px]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-[70%]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[60%] ml-auto" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[60%] ml-auto" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="pt-2">
                  <Skeleton className="h-4 w-[30%] mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-[80px]" />
                    <Skeleton className="h-8 w-[80px]" />
                    <Skeleton className="h-8 w-[80px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsLoading;
