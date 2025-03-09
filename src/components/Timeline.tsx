
import React from 'react';
import { TeamMember as TeamMemberType } from '@/lib/types';
import TeamMember from './TeamMember';
import { ChevronDown } from 'lucide-react';

interface TimelineProps {
  members: TeamMemberType[];
}

const Timeline: React.FC<TimelineProps> = ({ members }) => {
  // Get the weeks from the first member (assuming all members have the same weeks)
  const weeks = members.length > 0 ? Object.keys(members[0].weeklyHours) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-slide-up">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Timeline / hours logged</h2>
        <div className="flex items-center text-gray-600 text-sm">
          <span>Sort Most hours</span>
          <ChevronDown className="ml-1 w-4 h-4" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-[150px_1fr] mb-2">
          <div className="text-sm text-gray-500 uppercase">Member</div>
          <div className="grid grid-cols-4">
            {weeks.map(week => (
              <div key={week} className="text-sm text-gray-500 uppercase text-center">
                {week}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          {members.map(member => (
            <TeamMember 
              key={member.id} 
              member={member} 
              showWeeklyHours={true} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
