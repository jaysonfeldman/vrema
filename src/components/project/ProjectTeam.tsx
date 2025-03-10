import React from 'react';
import { TeamMember } from '@/lib/types';
interface ProjectTeamProps {
  members: TeamMember[];
}
const ProjectTeam: React.FC<ProjectTeamProps> = ({
  members
}) => {
  if (members.length === 0) return null;
  return <>
      {members.slice(0, 4).map((member, index) => <div key={member.id} className="w-10 h-10 rounded-full border-2 border-zinc-800 overflow-hidden" style={{
      zIndex: members.length - index
    }}>
          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover hide\n" />
        </div>)}
      {members.length > 4 && <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xs border-2 border-zinc-800">
          +{members.length - 4}
        </div>}
    </>;
};
export default ProjectTeam;