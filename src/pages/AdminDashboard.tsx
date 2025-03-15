
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';
import { toast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Add more detailed logging
    console.log("AdminDashboard component mounted");
    console.log("Current user state:", user);
    
    try {
      // If user is not admin, redirect to dashboard
      if (!user) {
        console.log("No user in context, still loading...");
        setIsLoading(true);
      } else if (!user.isAdmin) {
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
  }, [user, navigate]);

  // Add debugging to see if component renders at all
  console.log("Rendering AdminDashboard component, loading:", isLoading, "error:", error);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center p-8">
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
    console.log("Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-purple-800">Loading...</h1>
          <p className="mt-2 text-gray-600">Please wait while we check your credentials</p>
        </div>
      </div>
    );
  }
  
  if (!user.isAdmin) {
    console.log("User is not an admin, showing access denied");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-800">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have admin privileges</p>
          <button 
            onClick={() => navigate('/home')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  console.log("Rendering admin dashboard content");
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
