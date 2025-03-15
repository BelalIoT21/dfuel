
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      console.log('No user detected, redirecting to login');
      navigate('/');
      return;
    }
    
    // Check if user is not an admin and redirect
    if (!user.isAdmin) {
      console.log('Non-admin user detected, redirecting to dashboard');
      navigate('/home');
    } else {
      console.log('Admin user confirmed, staying on admin dashboard');
    }
  }, [user, navigate]);

  // Early return with loading state if user is not available yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-purple-800">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Return null if the user is not an admin (will be redirected by the useEffect)
  if (!user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end gap-2 mb-4">
          <Link to="/admin/users">
            <Button variant="outline" className="bg-white">
              Manage Users
            </Button>
          </Link>
        </div>
        <DashboardContent />
      </div>
    </div>
  );
};

export default AdminDashboard;
