
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Booking from './pages/Booking';
import MachineDetail from './pages/MachineDetail';
import Course from './pages/Course';
import Quiz from './pages/Quiz';
import ActiveBookings from './pages/ActiveBookings';
import AdminUsers from './pages/AdminUsers';
import AdminMachines from './pages/AdminMachines';
import { Toaster } from '../server/src/components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  console.log("Rendering App component");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/machines" element={<AdminMachines />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/machine/:id" element={<MachineDetail />} />
            <Route path="/course/:id" element={<Course />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/bookings" element={<ActiveBookings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
