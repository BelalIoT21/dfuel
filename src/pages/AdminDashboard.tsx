
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';
import { AdminAccessRequired } from '@/components/admin/users/AdminAccessRequired';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/services/apiService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const validateAdminAccess = async () => {
      try {
        setIsLoading(true);
        
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please log in to access the admin dashboard.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        // Verify admin access with backend
        if (!user.isAdmin) {
          toast({
            title: "Admin access required",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive"
          });
          navigate('/home');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error("Admin validation error:", error);
        toast({
          title: "Authentication error",
          description: "There was a problem verifying your admin access.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    validateAdminAccess();
  }, [user, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
    </div>;
  }
  
  if (!user || !isAdmin) {
    return <AdminAccessRequired />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
