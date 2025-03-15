
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
import { isWeb } from '@/utils/platform';
import { toast } from '@/components/ui/use-toast';

export const DashboardContent = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [machineData, setMachineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Load users and machine data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all users using our API service
        try {
          const response = await apiService.getAllUsers();
          if (response.data) {
            setAllUsers(response.data);
          }
        } catch (userError) {
          console.error("Error loading users:", userError);
          // Continue with empty users array rather than failing entirely
          setAllUsers([]);
        }
        
        // Get machine statuses - use the default data if API fails
        try {
          // Try to get machines from API first
          if (isWeb) {
            const machinesResponse = await apiService.request('machines', 'GET');
            if (machinesResponse.data && machinesResponse.data.length > 0) {
              setMachineData(machinesResponse.data);
            } else {
              // Fallback to static data with status
              const machinesWithStatus = machines.map(machine => ({
                ...machine,
                status: 'available'
              }));
              setMachineData(machinesWithStatus);
            }
          } else {
            // For native, use the machineStatus endpoint for each machine
            const machinesWithStatus = await Promise.all(machines.map(async (machine) => {
              try {
                const statusResponse = await apiService.getMachineStatus(machine.id);
                return {
                  ...machine,
                  status: statusResponse.data || 'available'
                };
              } catch (err) {
                return {
                  ...machine,
                  status: 'available'
                };
              }
            }));
            setMachineData(machinesWithStatus);
          }
        } catch (machineError) {
          console.error("Error loading machine data:", machineError);
          // Fallback to default machines with default status
          const machinesWithStatus = machines.map(machine => ({
            ...machine,
            status: 'available'
          }));
          setMachineData(machinesWithStatus);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Please refresh the page.");
        setLoading(false);
        
        toast({
          title: "Error loading dashboard",
          description: "There was a problem loading the dashboard data. Some features may be limited.",
          variant: "destructive"
        });
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto page-transition">
        <AdminHeader />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto page-transition">
        <AdminHeader />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-6">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
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
