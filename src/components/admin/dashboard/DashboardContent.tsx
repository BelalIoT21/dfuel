
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
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [machineData, setMachineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debug render
  console.log("Rendering DashboardContent component", { user });
  
  useEffect(() => {
    // Load users and machine data
    const fetchData = async () => {
      console.log("fetchData called in DashboardContent");
      try {
        console.log("Fetching admin dashboard data");
        setIsLoading(true);
        setError(null);
        
        if (!user || !user.isAdmin) {
          console.error("User is not admin or not logged in");
          setError("You must be logged in as an admin to view this page");
          setIsLoading(false);
          return;
        }
        
        // Get all users using our API service
        try {
          console.log("Fetching all users");
          const response = await apiService.getAllUsers();
          console.log("API response for users:", response);
          if (response.data) {
            setAllUsers(response.data);
          } else if (response.error) {
            console.warn("Error fetching users:", response.error);
            toast({
              title: "Warning",
              description: "Could not load user data: " + response.error,
              variant: "destructive"
            });
          }
        } catch (userError) {
          console.error("Error fetching users:", userError);
          // Don't fail completely, just log the error
          toast({
            title: "Warning",
            description: "Could not load user data",
            variant: "destructive"
          });
        }
        
        // Fall back to empty array for users if API call fails
        if (!allUsers.length) {
          console.log("No users from API, using empty array");
        }
        
        // Get machine statuses - using fallback data if API fails
        console.log("Processing machine data");
        try {
          console.log("Machines from data.ts:", machines);
          const machinesWithStatus = await Promise.all(machines.map(async (machine) => {
            try {
              const statusResponse = await apiService.getMachineStatus(machine.id);
              return {
                ...machine,
                status: statusResponse.data?.status || 'available'
              };
            } catch (machineError) {
              console.error(`Error fetching status for machine ${machine.id}:`, machineError);
              return {
                ...machine,
                status: 'unknown'
              };
            }
          }));
          console.log("Processed machine data:", machinesWithStatus);
          setMachineData(machinesWithStatus);
        } catch (machineError) {
          console.error("Error processing machines:", machineError);
          // Use machines without status as fallback
          const fallbackMachines = machines.map(machine => ({ ...machine, status: 'unknown' }));
          console.log("Using fallback machine data:", fallbackMachines);
          setMachineData(fallbackMachines);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  console.log("DashboardContent state:", { isLoading, error, userCount: allUsers.length, machineCount: machineData.length });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto page-transition">
        <AdminHeader />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto page-transition">
        <AdminHeader />
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-6">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-purple-600 hover:text-purple-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Ensure we have fallback data even if APIs fail
  const usersToDisplay = allUsers.length > 0 ? allUsers : [];
  const machinesToDisplay = machineData.length > 0 ? machineData : machines.map(m => ({ ...m, status: 'unknown' }));

  return (
    <div className="max-w-7xl mx-auto page-transition">
      <AdminHeader />
      <StatsOverview allUsers={usersToDisplay} machines={machines} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <PlatformOverview allUsers={usersToDisplay} />
        <QuickActions />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <PendingActions />
        <MachineStatus machineData={machinesToDisplay} setMachineData={setMachineData} />
      </div>
    </div>
  );
};
