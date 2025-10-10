import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Devotional from "./pages/Devotional";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import PastorPanel from "./pages/PastorPanel";
import ManageUsers from "./pages/ManageUsers";
import ManageChallenges from "./pages/ManageChallenges";
import MyMessages from "./pages/MyMessages";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/devotional" 
            element={
              <ProtectedRoute>
                <Devotional />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } 
          />
            <Route 
              path="/manage-users" 
              element={
                <ProtectedRoute requireAdmin>
                  <ManageUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-challenges" 
              element={
                <ProtectedRoute requireAdmin>
                  <ManageChallenges />
                </ProtectedRoute>
              } 
            />
          <Route 
            path="/pastor-panel" 
            element={
              <ProtectedRoute>
                <PastorPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-messages" 
            element={
              <ProtectedRoute>
                <MyMessages />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
