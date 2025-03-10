
import React from 'react';
import { TeamMember } from '@/lib/types';

interface ProjectTeamProps {
  members: TeamMember[];
}

const ProjectTeam: React.FC<ProjectTeamProps> = ({ members }) => {
  if (members.length === 0) return null;
  
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 3).map((member, index) => (
        <div 
          key={member.id} 
          className="w-8 h-8 rounded-full border-2 border-zinc-800 overflow-hidden"
          style={{ zIndex: members.length - index }}
        >
          <img 
            src={member.avatar} 
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {members.length > 3 && (
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs border-2 border-zinc-800">
          +{members.length - 3}
        </div>
      )}
    </div>
  );
};

export default ProjectTeam;
