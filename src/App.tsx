import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleAuthProvider, useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import Dashboard from '@/pages/Index';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Login from '@/pages/login';
import Activities from '@/pages/Activities';
import Guide from '@/pages/Guide';
import Feedback from '@/pages/Feedback';
import Categories from '@/pages/Categories';
import ProjectDetail from '@/pages/ProjectDetail';
import CalendarPage from '@/pages/Calendar';
import TeamPage from '@/pages/Team';
import AcceptInvite from '@/pages/AcceptInvite';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import DemoPreview from '@/pages/DemoPreview';
import DemoEmbed from '@/pages/DemoEmbed';
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
        <TooltipProvider delayDuration={400}>
          <Router>
            <GoogleAuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/invite/:token" element={<AcceptInvite />} />

                {/* Framer embed only — scales the landing preview, does not alter app UI */}
                <Route path="/demo" element={<DemoEmbed />} />

                {/* Landing-page interactive preview (original desktop app experience) */}
                <Route path="/preview" element={<DemoPreview />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<Navigate to="app" replace />} />
                    <Route path="app" element={<Dashboard />} />
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="team" element={<TeamPage />} />
                    <Route path="projects" element={<Navigate to="/preview/app" replace />} />
                    <Route path="projects/:projectId" element={<ProjectDetail />} />
                    <Route path="activities" element={<Activities />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="guide" element={<Guide />} />
                    <Route path="feedback" element={<Feedback />} />
                  </Route>
                </Route>

                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/app" element={<Dashboard />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/projects" element={<Navigate to="/app" replace />} />
                  <Route path="/projects/:projectId" element={<ProjectDetail />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/guide" element={<Guide />} />
                  <Route path="/feedback" element={<Feedback />} />
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
