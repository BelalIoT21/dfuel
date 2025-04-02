
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";
import ActiveBookings from "./pages/ActiveBookings";
import Course from "./pages/Course";
import Quiz from "./pages/Quiz";
import MachineDetail from "./pages/MachineDetail";
import AdminUsers from "./pages/AdminUsers";
import AdminMachines from "./pages/AdminMachines";
import AdminMachineEdit from "./pages/AdminMachineEdit";
import AdminCourses from "./pages/AdminCourses";
import AdminCourseEdit from "./pages/AdminCourseEdit";
import AdminQuizzes from "./pages/AdminQuizzes";
import AdminQuizEdit from "./pages/AdminQuizEdit";

// Protected route wrapper to ensure auth is available
const ProtectedRoute = ({ children }) => {
  try {
    const { user, loading } = useAuth();
    
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    if (!user) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  } catch (error) {
    console.error("Auth error in ProtectedRoute:", error);
    return <Navigate to="/" replace />;
  }
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
  try {
    const { user, loading } = useAuth();
    
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    if (!user?.isAdmin) {
      return <Navigate to="/home" replace />;
    }
    
    return children;
  } catch (error) {
    console.error("Auth error in AdminRoute:", error);
    return <Navigate to="/" replace />;
  }
};

function App() {
  console.log("Routes initialized, including /bookings for ActiveBookings page");
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/booking/:id" element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            } />
            
            <Route path="/bookings" element={
              <ProtectedRoute>
                <ActiveBookings />
              </ProtectedRoute>
            } />
            
            <Route path="/course/:id" element={
              <ProtectedRoute>
                <Course />
              </ProtectedRoute>
            } />
            
            <Route path="/quiz/:id" element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } />
            
            <Route path="/machine/:id" element={
              <ProtectedRoute>
                <MachineDetail />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            
            <Route path="/admin/machines" element={
              <AdminRoute>
                <AdminMachines />
              </AdminRoute>
            } />
            
            <Route path="/admin/machines/new" element={
              <AdminRoute>
                <AdminMachineEdit />
              </AdminRoute>
            } />
            
            <Route path="/admin/machines/edit/:id" element={
              <AdminRoute>
                <AdminMachineEdit />
              </AdminRoute>
            } />
            
            <Route path="/admin/courses" element={
              <AdminRoute>
                <AdminCourses />
              </AdminRoute>
            } />
            
            <Route path="/admin/courses/new" element={
              <AdminRoute>
                <AdminCourseEdit />
              </AdminRoute>
            } />
            
            <Route path="/admin/courses/edit/:id" element={
              <AdminRoute>
                <AdminCourseEdit />
              </AdminRoute>
            } />
            
            <Route path="/admin/quizzes" element={
              <AdminRoute>
                <AdminQuizzes />
              </AdminRoute>
            } />
            
            <Route path="/admin/quizzes/new" element={
              <AdminRoute>
                <AdminQuizEdit />
              </AdminRoute>
            } />
            
            <Route path="/admin/quizzes/edit/:id" element={
              <AdminRoute>
                <AdminQuizEdit />
              </AdminRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
