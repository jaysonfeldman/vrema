
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectDetailHeaderProps {
  projectName: string;
  onEditClick: () => void;
}

const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  projectName,
  onEditClick,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{projectName}</h1>
      </div>
      
      <Button onClick={onEditClick}>
        Edit Project
      </Button>
    </div>
  );
};

export default ProjectDetailHeader;
