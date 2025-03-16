
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If no user is logged in, redirect to login page
    if (!user) {
      navigate('/');
      return;
    }
    
    // If user is not an admin, redirect to home dashboard
    if (!user.isAdmin) {
      navigate('/home');
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
