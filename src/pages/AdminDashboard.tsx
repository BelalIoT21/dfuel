
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    console.log("AdminDashboard component mounted");
    console.log("Auth state:", { user: user?.name || "null", loading, isAdmin: user?.isAdmin });
    
    // Set page as loaded after a small delay to ensure auth state is processed
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Only check authentication after we've confirmed page is loaded
    // and auth state is no longer loading
    if (isPageLoaded && !loading) {
      if (!user) {
        console.log("User not authenticated, redirecting to login");
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
      
      console.log("User is authenticated admin, showing dashboard");
    }
  }, [user, loading, isPageLoaded, navigate]);

  // Show loading spinner while auth is being checked
  if (loading || !isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // If auth check is complete but no user or not admin, render nothing
  // (we'll redirect in useEffect)
  if (!user || !user.isAdmin) {
    return null;
  }

  // If we get here, we have a user with admin privileges
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
