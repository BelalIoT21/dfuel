
import { useState, useEffect } from 'react';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { machines } from '../utils/data';
import userDatabase from '../services/userDatabase';
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsOverview } from '@/components/admin/StatsOverview';
import { PlatformOverview } from '@/components/admin/PlatformOverview';
import { QuickActions } from '@/components/admin/QuickActions';
import { PendingActions } from '@/components/admin/PendingActions';
import { MachineStatus } from '@/components/admin/MachineStatus';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [machineData, setMachineData] = useState<any[]>([]);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Load users and machine data
    const users = userDatabase.getAllUsers();
    setAllUsers(users);
    
    // Get machine statuses
    const machinesWithStatus = machines.map(machine => {
      const status = userDatabase.getMachineStatus(machine.id);
      return {
        ...machine,
        status: status || 'available'
      };
    });
    setMachineData(machinesWithStatus);
  }, []);
  
  if (!user?.isAdmin) {
    navigate('/home');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-7xl mx-auto page-transition">
        <BackToAdminButton />
        <AdminHeader />
        <StatsOverview allUsers={allUsers} machines={machines} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          <PlatformOverview allUsers={allUsers} />
          <QuickActions />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <PendingActions />
          <MachineStatus machineData={machineData} setMachineData={setMachineData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
