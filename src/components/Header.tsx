
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Circle, User } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  
  useEffect(() => {
    // Simulate a sync every 60 seconds
    const interval = setInterval(() => {
      setLastSynced(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getTimeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - lastSynced.getTime()) / 1000);
    
    if (seconds < 60) {
      return 'just now';
    } else if (seconds < 120) {
      return '1 minute ago';
    } else {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minutes ago`;
    }
  };

  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-gray-200 animate-fade-in">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          timetracker2400
        </Link>
        <div className="flex items-center ml-8 text-sm text-gray-600">
          <Circle className="w-3 h-3 text-emerald-500 mr-2 fill-current" />
          <span>Hours synced {getTimeAgo()}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-8">
        <nav className="flex items-center space-x-6">
          <Link 
            to="/" 
            className={`py-2 border-b-2 ${
              location.pathname === '/' 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            } transition-all`}
          >
            Dashboard
          </Link>
          <Link 
            to="/projects" 
            className={`py-2 border-b-2 ${
              location.pathname === '/projects' 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            } transition-all`}
          >
            Projects
          </Link>
          <Link 
            to="/activities" 
            className={`py-2 border-b-2 ${
              location.pathname === '/activities' 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            } transition-all`}
          >
            Activities
          </Link>
        </nav>
        
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <User className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </header>
  );
};

export default Header;
