
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';
import { toast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is not admin and redirect
    if (user && !user.isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges',
        variant: 'destructive'
      });
      navigate('/dashboard');
    } else if (!user) {
      // If no user is logged in, redirect to login
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access the admin dashboard',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [user, navigate]);

  // If user is not loaded yet or not admin, don't render the dashboard
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
