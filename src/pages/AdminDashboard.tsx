
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsOverview } from '@/components/admin/StatsOverview';
import { PendingActions } from '@/components/admin/PendingActions';
import { MachineStatus } from '@/components/admin/MachineStatus';
import { QuickActions } from '@/components/admin/QuickActions';
import { useAuth } from '../context/AuthContext';
import { AdminAccessRequired } from '@/components/admin/users/AdminAccessRequired';
import { toast } from '@/components/ui/use-toast';
import { machines } from '@/utils/data';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filter out safety cabinet and safety course for machine count
  const actualMachines = machines.filter(
    machine => machine.id !== 'safety-cabinet' && machine.id !== '3' && machine.id !== 'safety-course'
  );
  
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges",
        variant: "destructive"
      });
      navigate('/home');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }
  
  if (!user.isAdmin) {
    return <AdminAccessRequired />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader />
        
        <StatsOverview allUsers={[]} machines={actualMachines} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MachineStatus machines={actualMachines} />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <PendingActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
