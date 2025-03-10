
import React from 'react';
import { cn } from '@/lib/utils';

interface ProjectStatusProps {
  totalHours: number;
  budgetHours?: number;
  monthlyHours?: number; // Changed from boolean to number to match the Project type
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ 
  totalHours, 
  budgetHours,
  monthlyHours
}) => {
  // Is the project over budget?
  const isOverBudget = budgetHours && totalHours > budgetHours;
  
  // Format budget info
  const getBudgetText = () => {
    if (!budgetHours) return null;
    
    const diff = Math.abs(budgetHours - totalHours);
    const formattedDiff = formatTime(diff);
    
    if (isOverBudget) {
      return `-${formattedDiff}`;
    } else {
      return `${formattedDiff}`;
    }
  };
  
  const budgetText = getBudgetText();

  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div>
        <p className="text-sm text-gray-400 mb-1">Time logged</p>
        <p className="font-mono font-bold text-2xl">{formatTime(totalHours)}</p>
        <p className="text-xs text-gray-500 mt-1">in total</p>
      </div>
      
      {budgetHours && (
        <div>
          <p className="text-sm text-gray-400 mb-1">Budget left</p>
          <p className={cn(
            "font-mono font-bold text-2xl",
            isOverBudget ? "text-red-500" : "text-amber-500"
          )}>
            {budgetText}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {monthlyHours ? "/this month" : "in total"}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function for formatting time
const formatTime = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (h === 0) {
    return `${m}m`;
  } else if (m === 0) {
    return `${h}h`;
  } else {
    return `${h}h ${m}m`;
  }
};

export default ProjectStatus;
