
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
  console.log(`ProjectStatus - Total Hours: ${totalHours}, Budget Hours: ${budgetHours}, Monthly Hours: ${monthlyHours}`);
  
  // Is the project over budget?
  const isOverBudget = budgetHours && totalHours > budgetHours;
  
  // Format budget info
  const getBudgetText = () => {
    if (!budgetHours) return null;
    
    const diff = Math.abs(budgetHours - totalHours);
    const h = Math.floor(diff);
    const m = Math.round((diff - h) * 60);
    
    return `${h}:${m.toString().padStart(2, '0')}`;
  };
  
  const budgetText = getBudgetText();
  
  // Format total hours
  const formattedTotalHours = formatTime(totalHours);

  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div>
        <p className="text-sm text-gray-400 mb-1">Time logged</p>
        <p className="font-mono font-bold text-2xl">{formattedTotalHours}</p>
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
            {monthlyHours ? "/this month" : "/in total"}
          </p>
        </div>
      )}
      
      {!budgetHours && (
        <div>
          <p className="text-sm text-gray-400 mb-1">Budget</p>
          <p className="font-mono font-bold text-2xl text-gray-500">
            Not set
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
  
  return `${h}:${m.toString().padStart(2, '0')}`;
};

export default ProjectStatus;
