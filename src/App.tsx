
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Activities from '@/pages/Activities';
import NotFound from '@/pages/NotFound';
import { GoogleAuthProviderWrapper } from '@/providers/GoogleAuthProvider';
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import ProjectDetail from '@/pages/ProjectDetail';

function App() {
  const queryClient = new QueryClient();

  return (
    <GoogleAuthProviderWrapper>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/project/:projectId" element={<ProjectDetail />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </GoogleAuthProviderWrapper>
  );
}

export default App;
