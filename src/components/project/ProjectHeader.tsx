
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProjectHeaderProps {
  name: string;
  projectTag?: string | null;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ name, projectTag }) => {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-3xl font-semibold">{name}</h3>
      {projectTag && (
        <Badge variant="outline" className="bg-zinc-700 text-white border-zinc-600 text-sm">
          {projectTag}
        </Badge>
      )}
    </div>
  );
};

export default ProjectHeader;
