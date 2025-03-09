
import React from 'react';
import { TeamMember as TeamMemberType } from '@/lib/types';
import { formatTime } from '@/lib/mock-data';

interface TeamMemberProps {
  member: TeamMemberType;
  showWeeklyHours?: boolean;
}

const TeamMember: React.FC<TeamMemberProps> = ({ member, showWeeklyHours = false }) => {
  return (
    <div className="border-b border-gray-200 py-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src={member.avatar} 
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium">{member.name}</span>
        </div>
        
        {!showWeeklyHours && (
          <div className="text-right">
            <span className="font-mono">{formatTime(member.hoursLogged)}</span>
          </div>
        )}
        
        {showWeeklyHours && (
          <div className="flex space-x-10">
            {Object.entries(member.weeklyHours).map(([week, hours]) => (
              <div key={week} className="text-center w-16">
                <span className="font-mono">
                  {hours ? formatTime(hours) : "--:--"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMember;
