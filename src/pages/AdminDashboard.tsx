
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is not an admin, redirect to dashboard
    if (user && !user.isAdmin) {
      navigate('/dashboard');
    } else if (!user) {
      // If user is not logged in, redirect to login page
      navigate('/');
    }
  }, [user, navigate]);

  // Show loading or nothing until redirection happens
  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
