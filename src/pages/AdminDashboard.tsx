
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminChecked, setAdminChecked] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = () => {
      console.log("AdminDashboard - Checking admin status");
      console.log("Current user:", user);
      
      try {
        if (!user) {
          console.log("No user in context, waiting for auth...");
          // Don't navigate away yet, user might still be loading
          return;
        }
        
        setAdminChecked(true);
        
        if (!user.isAdmin) {
          console.log("User is not admin, redirecting:", user);
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges",
            variant: "destructive"
          });
          navigate('/dashboard');
        } else {
          console.log("Admin user detected:", user.email);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error in AdminDashboard effect:", err);
        setError("An error occurred while checking admin access");
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user, navigate]);
  
  // If more than 3 seconds pass and we still don't have user data, show a message
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !adminChecked && !user) {
        console.log("Auth is taking too long, showing timeout message");
        setError("Authentication is taking longer than expected. Please try refreshing the page.");
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, adminChecked, user]);

  // Add debugging to see if component renders at all
  console.log("Rendering AdminDashboard component, loading:", isLoading, "error:", error, "user:", user?.email);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-800">Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Check if user exists and has admin privileges
  if (isLoading || !user) {
    console.log("Showing loading state for admin dashboard");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center p-8 max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h1 className="text-2xl font-bold text-purple-800">Loading Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }
  
  if (!user.isAdmin) {
    console.log("User is not an admin, showing access denied");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-800">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have admin privileges</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log("Rendering admin dashboard content for:", user.email);
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
