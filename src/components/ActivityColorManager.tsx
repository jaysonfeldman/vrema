import React from 'react';
import { useSharedState } from '@/hooks/useSharedState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ActivityColorManager() {
  const { activityColors, updateActivityColor } = useSharedState();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Activity Colors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activityColors.map((activity) => (
          <div 
            key={activity.type}
            className="p-4 rounded-lg border border-zinc-200 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">#{activity.type}</Label>
              <div 
                className="w-8 h-8 rounded-md"
                style={{ backgroundColor: activity.color }}
              />
            </div>
            <Input
              type="color"
              value={activity.color}
              onChange={(e) => updateActivityColor(activity.type, e.target.value)}
              className="w-full h-10"
            />
            <Input
              type="text"
              value={activity.color}
              onChange={(e) => updateActivityColor(activity.type, e.target.value)}
              className="w-full"
              placeholder="#000000"
            />
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-zinc-500">
        <p>These colors will be applied to all activities across your projects.</p>
      </div>
    </div>
  );
} 