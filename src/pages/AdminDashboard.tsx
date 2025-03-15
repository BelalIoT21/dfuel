
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';
import { toast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("AdminDashboard - Current user:", user);
    if (!user) {
      console.log("No user found, redirecting to login");
      toast({
        title: "Authentication required",
        description: "Please log in to access the admin dashboard",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    if (!user.isAdmin) {
      console.log("User is not admin, redirecting to home");
      toast({
        title: "Access denied",
        description: "You do not have permission to access the admin dashboard",
        variant: "destructive"
      });
      navigate('/home');
      return;
    }
    
    console.log("User is admin, showing dashboard");
  }, [user, navigate]);

  // Show loading state if still checking user
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Loading admin dashboard...</p>
    </div>;
  }

  // If we get here, we have a user with admin privileges
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
