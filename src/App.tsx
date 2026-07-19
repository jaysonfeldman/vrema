import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleAuthProvider, useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import Dashboard from '@/pages/Index';
import Login from '@/pages/login';
import Projects from '@/pages/Projects';
import Activities from '@/pages/Activities';
import ProjectDetail from '@/pages/ProjectDetail';
import NotFound from '@/pages/NotFound';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useGoogleAuth();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <GoogleAuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:projectId" element={<ProjectDetail />} />
                  <Route path="/activities" element={<Activities />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </GoogleAuthProvider>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
