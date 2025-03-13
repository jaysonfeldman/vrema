import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { Button } from '@/components/ui/button';

export default function Login() {
  const { signIn, authState } = useGoogleAuth();

  // If already authenticated, redirect to home
  if (authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-medium tracking-tight">
            Welcome to timetracker2400
          </h1>
          <p className="mt-2 text-gray-500">
            Connect your Google Calendar to start tracking your time
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
          <div className="space-y-2 text-sm text-gray-500">
            <p>By connecting your Google Calendar, you can:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Track time automatically from calendar events</li>
              <li>Organize events into projects</li>
              <li>Generate reports and insights</li>
            </ul>
          </div>

          <Button
            onClick={signIn}
            className="w-full flex items-center justify-center space-x-2 py-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <p className="text-xs text-center text-gray-400">
            We only request access to your calendar events. You can revoke access at any time.
          </p>
        </div>
      </div>
    </div>
  );
} 