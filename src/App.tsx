import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Devotional from "./pages/Devotional";
import DevotionalHistory from "./pages/DevotionalHistory";
import DailyReading from "./pages/DailyReading";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import PastorPanel from "./pages/PastorPanel";
import ManageUsers from "./pages/ManageUsers";
import ManageChallenges from "./pages/ManageChallenges";
import ManageDailyReadings from "./pages/ManageDailyReadings";
import ManageDevotionals from "./pages/ManageDevotionals";
import CreateDevotional from "./pages/CreateDevotional";
import MyMessages from "./pages/MyMessages";
import PushDebug from "./pages/PushDebug";
import BibleVideos from "./pages/BibleVideos";
import ManageBibleVideos from "./pages/ManageBibleVideos";
import BibleStudies from "./pages/BibleStudies";
import ManageBibleStudies from "./pages/ManageBibleStudies";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/install" element={<Install />} />
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
            path="/devotional-history" 
            element={
              <ProtectedRoute>
                <DevotionalHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/daily-reading" 
            element={
              <ProtectedRoute>
                <DailyReading />
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
              path="/manage-daily-readings" 
              element={
                <ProtectedRoute requireAdmin>
                  <ManageDailyReadings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-devotionals" 
              element={
                <ProtectedRoute requireAdmin>
                  <ManageDevotionals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-devotional" 
              element={
                <ProtectedRoute requireAdmin>
                  <CreateDevotional />
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
          <Route 
            path="/push-debug" 
            element={
              <ProtectedRoute>
                <PushDebug />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bible-videos" 
            element={
              <ProtectedRoute>
                <BibleVideos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-bible-videos" 
            element={
              <ProtectedRoute requireAdmin>
                <ManageBibleVideos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bible-studies" 
            element={
              <ProtectedRoute>
                <BibleStudies />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-bible-studies" 
            element={
              <ProtectedRoute requireAdmin>
                <ManageBibleStudies />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
