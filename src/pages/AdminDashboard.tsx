
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is not admin, redirect to dashboard
    if (!user?.isAdmin) {
      console.log("User is not admin, redirecting");
      navigate('/dashboard');
    } else {
      console.log("Admin user detected:", user.email);
    }
  }, [user, navigate]);

  // Add debugging to see if component renders at all
  console.log("Rendering AdminDashboard component");

  // Check if user exists and has admin privileges
  if (!user) {
    console.log("No user found in context");
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
    console.log("User is not an admin");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
