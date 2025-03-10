
import React from 'react';
import { cn } from '@/lib/utils';

interface ProjectStatusProps {
  totalHours: number;
  budgetHours?: number;
  monthlyHours?: number;
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ 
  totalHours, 
  budgetHours,
  monthlyHours
}) => {
  // Format total hours
  const formattedTotalHours = formatTime(totalHours);
  
  // Calculate monthly hours remaining if budget exists
  const monthlyBudget = monthlyHours !== undefined;
  const hoursLeft = monthlyBudget && budgetHours 
    ? budgetHours - (monthlyHours || 0)
    : (budgetHours ? budgetHours - totalHours : null);
    
  const isOverBudget = hoursLeft !== null && hoursLeft < 0;
  
  // Format hours left
  const formattedHoursLeft = hoursLeft !== null 
    ? formatTime(Math.abs(hoursLeft)) 
    : "Not set";

  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div>
        <p className="text-sm text-gray-400 mb-1">Time logged</p>
        <p className="font-mono font-bold text-2xl">{formattedTotalHours}</p>
      </div>
      
      <div>
        <p className="text-sm text-gray-400 mb-1">Hours left</p>
        <p className={cn(
          "font-mono font-bold text-2xl",
          isOverBudget ? "text-red-400" : hoursLeft !== null ? "text-amber-400" : "text-gray-500"
        )}>
          {formattedHoursLeft}
        </p>
        {hoursLeft !== null && (
          <p className="text-xs text-gray-500 mt-1">
            {monthlyBudget ? "/this month" : "/in total"}
          </p>
        )}
      </div>
    </div>
  );
};

// Helper function for formatting time
const formatTime = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  return `${h}:${m.toString().padStart(2, '0')}`;
};

export default ProjectStatus;
