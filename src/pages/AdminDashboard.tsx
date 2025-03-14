
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';
import { AdminAccessRequired } from '@/components/admin/users/AdminAccessRequired';
import { toast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is not logged in or not an admin
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the admin dashboard.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    if (!user.isAdmin) {
      toast({
        title: "Admin access required",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      navigate('/home');
    }
  }, [user, navigate]);

  // Show loading or unauthorized screen if needed
  if (!user) {
    return null; // Navigate will handle redirect
  }
  
  if (!user.isAdmin) {
    return <AdminAccessRequired />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
