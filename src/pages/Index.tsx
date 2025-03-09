
import React from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import CalendarProjectsList from '@/components/CalendarProjectsList';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <GoogleCalendarSync />
        <CalendarProjectsList />
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
