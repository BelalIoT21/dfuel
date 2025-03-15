
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
import { toast } from '@/components/ui/use-toast';

export const DashboardContent = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [machineData, setMachineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    console.log("DashboardContent - Mounting component");
    // Load users and machine data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        console.log("Fetching dashboard data...");
        
        // Get all users using our API service
        const response = await apiService.getAllUsers();
        if (response.data) {
          console.log("Got users data:", response.data.length, "users");
          setAllUsers(response.data);
        } else {
          console.warn("No user data returned from API");
          // Use empty array as fallback
          setAllUsers([]);
        }
        
        // Get machine statuses
        console.log("Fetching machine statuses for", machines.length, "machines");
        const machinesWithStatus = await Promise.all(machines.map(async (machine) => {
          try {
            const statusResponse = await apiService.getMachineStatus(machine.id);
            const status = statusResponse.data?.status || 'available';
            console.log("Status for machine", machine.id, ":", status);
            return {
              ...machine,
              status
            };
          } catch (err) {
            console.error("Error fetching status for machine", machine.id, err);
            return {
              ...machine,
              status: 'available'
            };
          }
        }));
        console.log("Processed machine data:", machinesWithStatus.length, "items");
        setMachineData(machinesWithStatus);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError(true);
        toast({
          title: "Data loading error",
          description: "Could not load dashboard data. Using fallback data.",
          variant: "destructive"
        });
        // Set fallback data
        setAllUsers([]);
        setMachineData(machines.map(m => ({ ...m, status: 'available' })));
      } finally {
        setLoading(false);
        console.log("Data loading complete");
      }
    };
    
    fetchData();
    
    return () => {
      console.log("DashboardContent - Unmounting component");
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto page-transition">
        <AdminHeader />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

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
