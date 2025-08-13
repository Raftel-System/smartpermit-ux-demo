import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { AppProvider } from "@/contexts/AppContext";
import { Dashboard } from "@/pages/Dashboard";
import { ValidationPage } from "@/pages/ValidationPage";
import NotFound from "./pages/NotFound";
import PermitsPage from "@/pages/PermitsPage.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [userRole, setUserRole] = useState<'user' | 'supervisor' | 'director'>('user');
  const [userName] = useState('Jean Dupont');

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar userRole={userRole} />
              <div className="flex-1 flex flex-col">
                <AppHeader 
                  userRole={userRole} 
                  userName={userName}
                  onRoleChange={setUserRole}
                />
                <main className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard userRole={userRole} />} />
                    <Route path="/jmt" element={<Dashboard userRole={userRole} />} />
                    <Route path="/permits" element={<PermitsPage currentUserName="Utilisateur Test" />} />
                    <Route path="/validations" element={
                      userRole !== 'user' ? 
                        <ValidationPage userRole={userRole as 'supervisor' | 'director'} /> : 
                        <Dashboard userRole={userRole} />
                    } />
                    <Route path="/teams" element={<Dashboard userRole={userRole} />} />
                    <Route path="/reports" element={<Dashboard userRole={userRole} />} />
                    <Route path="/settings" element={<Dashboard userRole={userRole} />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
  );
};

export default App;
