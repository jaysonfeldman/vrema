import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleAuthProvider, useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import Dashboard from '@/pages/Index';
import Login from '@/pages/login';
import AuthCallback from '@/pages/AuthCallback';
import Projects from '@/pages/Projects';
import Activities from '@/pages/Activities';
import ProjectDetail from '@/pages/ProjectDetail';
import NotFound from '@/pages/NotFound';
import AppLayout from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: hasSupabaseSession, isLoading } = useAuth();
  const { authState } = useGoogleAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-canvas">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasSupabaseSession && !authState.isAuthenticated) {
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
            <AuthProvider>
              <GoogleAuthProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
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
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
