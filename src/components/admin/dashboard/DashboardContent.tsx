
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../services/apiService';
import { machines } from '../../../utils/data';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsOverview } from '@/components/admin/StatsOverview';
import { PlatformOverview } from '@/components/admin/PlatformOverview';
import { QuickActions } from '@/components/admin/QuickActions';
import { PendingActions } from '@/components/admin/PendingActions';
import { MachineStatus } from '@/components/admin/MachineStatus';
import { useToast } from '@/hooks/use-toast';
import userDatabase from '../../../services/userDatabase';

export const DashboardContent = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [machineData, setMachineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load users and machine data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Try to get users from API first
        const response = await apiService.getAllUsers();
        
        if (response.data) {
          setAllUsers(response.data);
        } else {
          // Fallback to local storage if API fails
          console.log("API failed, using local storage for users");
          const localUsers = await userDatabase.getAllUsers();
          setAllUsers(localUsers);
        }
        
        // Filter out safety cabinet and safety course - they're not real machines
        const regularMachines = machines.filter(
          machine => machine.id !== 'safety-cabinet' && machine.id !== 'safety-course'
        );
        
        // Get machine statuses with fallback to 'available' if API fails
        const machinesWithStatus = await Promise.all(regularMachines.map(async (machine) => {
          try {
            const statusResponse = await apiService.getMachineStatus(machine.id);
            return {
              ...machine,
              status: statusResponse.data?.status || 'available',
              note: statusResponse.data?.note || ''
            };
          } catch (error) {
            console.log(`Failed to get status for ${machine.name}, using default`);
            return {
              ...machine,
              status: 'available',
              note: ''
            };
          }
        }));
        
        setMachineData(machinesWithStatus);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        
        // Fallback for users
        const localUsers = await userDatabase.getAllUsers();
        setAllUsers(localUsers);
        
        // Fallback for machines
        const regularMachines = machines.filter(
          machine => machine.id !== 'safety-cabinet' && machine.id !== 'safety-course'
        );
        const fallbackMachines = regularMachines.map(machine => ({
          ...machine,
          status: 'available',
          note: ''
        }));
        setMachineData(fallbackMachines);
        
        toast({
          title: "Connection Error",
          description: "Could not connect to API server. Using local data instead.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  return (
    <div className="max-w-7xl mx-auto page-transition">
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
  );
};
