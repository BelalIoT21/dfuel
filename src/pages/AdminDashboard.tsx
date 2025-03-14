
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminHeader } from '../components/admin/AdminHeader';
import { PlatformOverview } from '../components/admin/PlatformOverview';
import QuickActions from '../components/admin/QuickActions';
import { StatsOverview } from '../components/admin/StatsOverview';
import { PendingActions } from '../components/admin/PendingActions';
import { DashboardContent } from '../components/admin/dashboard/DashboardContent';
import { MachineStatus } from '../components/admin/MachineStatus';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { machines } from '../utils/data';
import userDatabase from '../services/userDatabase';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [machineData, setMachineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect non-admin users
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      navigate('/home');
    }
    
    // Load machine data for admin
    const loadMachineData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would fetch from an API
        // For now, we'll use the mock data and enhance it with status info
        const enhancedMachines = await Promise.all(machines.map(async (machine) => {
          try {
            const status = await userDatabase.getMachineStatus(machine.id);
            const maintenanceNote = await userDatabase.getMachineMaintenanceNote(machine.id);
            
            return {
              ...machine,
              status: status || 'available',
              maintenanceNote
            };
          } catch (error) {
            console.error(`Error loading status for machine ${machine.id}:`, error);
            return {
              ...machine,
              status: 'available'
            };
          }
        }));
        
        setMachineData(enhancedMachines);
      } catch (error) {
        console.error("Error loading machine data:", error);
        toast({
          title: "Error",
          description: "Failed to load machine data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.isAdmin) {
      loadMachineData();
    }
  }, [user, navigate]);

  if (!user?.isAdmin) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6 page-transition">
        <AdminHeader />
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PlatformOverview />
            <MachineStatus 
              machineData={machineData} 
              setMachineData={setMachineData} 
            />
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
