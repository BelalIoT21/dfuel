
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
import ActiveBookings from "./pages/ActiveBookings";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { loadEnv } from "./utils/env";
import { toast } from "@/components/ui/use-toast";

// Create a new query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Load environment variables
  useEffect(() => {
    loadEnv();
    console.log("Environment variables loaded");
  }, []);

  // Set document title
  useEffect(() => {
    document.title = "Learnit - Your Learning Platform";
  }, []);

  // Display toast message only on first load
  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('welcomeShown');
    if (!hasShownWelcome) {
      toast({
        title: "Welcome to Learnit",
        description: "Please log in to continue",
      });
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, []);

  console.log("Rendering App component");

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Root path now redirects explicitly to the login page */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Index />} />
              <Route path="/home" element={<Home />} />
              <Route path="/machine/:id" element={<MachineDetail />} />
              <Route path="/course/:id" element={<Course />} />
              <Route path="/quiz/:id" element={<Quiz />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/machines" element={<AdminMachines />} />
              <Route path="/admin/bookings" element={<ActiveBookings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
