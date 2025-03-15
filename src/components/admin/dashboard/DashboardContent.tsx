
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

export const DashboardContent = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [machineData, setMachineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debug render
  console.log("Rendering DashboardContent component");
  
  useEffect(() => {
    // Load users and machine data
    const fetchData = async () => {
      try {
        console.log("Fetching admin dashboard data");
        setIsLoading(true);
        setError(null);
        
        // Get all users using our API service
        try {
          const response = await apiService.getAllUsers();
          console.log("API response for users:", response);
          if (response.data) {
            setAllUsers(response.data);
          }
        } catch (userError) {
          console.error("Error fetching users:", userError);
          // Don't fail completely, just log the error
        }
        
        // Get machine statuses
        try {
          const machinesWithStatus = await Promise.all(machines.map(async (machine) => {
            try {
              const statusResponse = await apiService.getMachineStatus(machine.id);
              return {
                ...machine,
                status: statusResponse.data || 'available'
              };
            } catch (machineError) {
              console.error(`Error fetching status for machine ${machine.id}:`, machineError);
              return {
                ...machine,
                status: 'unknown'
              };
            }
          }));
          setMachineData(machinesWithStatus);
        } catch (machineError) {
          console.error("Error processing machines:", machineError);
          // Use machines without status as fallback
          setMachineData(machines.map(machine => ({ ...machine, status: 'unknown' })));
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
