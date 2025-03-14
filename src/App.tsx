
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import MachineDetail from "./pages/MachineDetail";
import Course from "./pages/Course";
import Quiz from "./pages/Quiz";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminMachines from "./pages/AdminMachines";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { loadEnv } from "./utils/env";

const queryClient = new QueryClient();

const App = () => {
  // Load environment variables
  useEffect(() => {
    loadEnv();
  }, []);

  // Set document title
  useEffect(() => {
    document.title = "Learnit - Your Learning Platform";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Home />} />
              <Route path="/machine/:id" element={<MachineDetail />} />
              <Route path="/course/:id" element={<Course />} />
              <Route path="/quiz/:id" element={<Quiz />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/machines" element={<AdminMachines />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
