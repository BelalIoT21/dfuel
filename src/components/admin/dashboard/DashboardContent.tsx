
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Load users and machine data
    const fetchData = async () => {
      try {
        console.log("AdminDashboard: Fetching dashboard data...");
        setLoading(true);
        setError(null);
        
        // Get all users using our API service
        const response = await apiService.getAllUsers();
        console.log("AdminDashboard: User data response:", response);
        
        if (response.data) {
          setAllUsers(response.data);
        } else if (response.error) {
          console.error("Error fetching users:", response.error);
          setError(`Failed to load users: ${response.error}`);
        }
        
        // Get machine statuses
        console.log("AdminDashboard: Fetching machine statuses...");
        const machinesWithStatus = await Promise.all(machines.map(async (machine) => {
          try {
            const statusResponse = await apiService.getMachineStatus(machine.id);
            console.log(`Machine ${machine.id} status:`, statusResponse);
            return {
              ...machine,
              status: statusResponse.data?.status || 'available'
            };
          } catch (err) {
            console.error(`Error fetching status for machine ${machine.id}:`, err);
            return {
              ...machine,
              status: 'unknown'
            };
          }
        }));
        setMachineData(machinesWithStatus);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto page-transition">
        <AdminHeader />
        <div className="py-12 text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-purple-800">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto page-transition">
        <AdminHeader />
        <div className="py-12 text-center bg-red-50 rounded-lg p-6 mt-6">
          <div className="text-red-600 text-xl mb-2">⚠️ Error</div>
          <p className="text-red-700">{error}</p>
          <button 
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
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
