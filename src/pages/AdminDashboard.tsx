
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  // Safely use the Auth context with error handling
  let userContext;
  try {
    userContext = useAuth();
  } catch (err) {
    console.error('Auth context error:', err);
    setError('Authentication error. Please try logging in again.');
  }
  
  const { user } = userContext || { user: null };
  
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Early return if error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Early return if not admin to prevent flash of admin content
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
