
import React, { useState } from 'react';
import Header from '@/components/Header';
import ActivityTag from '@/components/ActivityTag';
import { projects, getActivityHours, formatTime } from '@/lib/mock-data';
import { BarChart, Calendar, Filter } from 'lucide-react';
import { ActivityType } from '@/lib/types';

const Activities: React.FC = () => {
  const activityTypes: ActivityType[] = ['design', 'strategy', 'dev', 'meetings', 'admin'];
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  
  // Get all activities across all projects
  const allActivities = projects.flatMap(project => 
    project.activities.map(activity => ({
      ...activity,
      projectName: project.name,
      projectId: project.id
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const filteredActivities = selectedActivity 
    ? allActivities.filter(activity => activity.type === selectedActivity) 
    : allActivities;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Activities</h1>
          
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>October 2023</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-black text-white rounded-md px-4 py-2 hover:bg-gray-800 transition-colors">
              <BarChart className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-slide-up">
            <h2 className="text-xl font-semibold mb-6">Activity Summary</h2>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {activityTypes.map(type => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded-md transition-all ${
                    selectedActivity === type 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedActivity(selectedActivity === type ? null : type)}
                >
                  #{type}
                </button>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {activityTypes.map(type => {
                  const hours = getActivityHours(type);
                  const percentage = Math.round((hours / getActivityHours(activityTypes[0])) * 100);
                  
                  return (
                    <div key={type} className="bg-gray-50 rounded-lg p-4">
                      <ActivityTag type={type} hours={hours} className="mb-3" />
                      <div className="text-3xl font-mono font-semibold">{formatTime(hours)}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {percentage}% of design time
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-semibold mb-6">Time by Project</h2>
            
            <div className="space-y-6">
              {projects.map(project => (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-sm font-mono">{formatTime(project.totalHours)}</span>
                  </div>
                  <div className="progress-bar bg-gray-100">
                    <div 
                      className="progress-bar-fill bg-gray-900"
                      style={{ 
                        width: `${(project.totalHours / projects[0].totalHours) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Activities</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredActivities.map((activity, index) => (
              <div key={index} className="p-6 flex flex-wrap md:flex-nowrap items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <ActivityTag type={activity.type} hours={activity.hours} className="mb-2" />
                  <p className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                
                <div className="text-right md:ml-4">
                  <p className="text-sm font-medium">{activity.projectName}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activities;
