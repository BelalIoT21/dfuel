
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../services/apiService';
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
  
  useEffect(() => {
    // Load users and machine data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all users using our API service
        const response = await apiService.getAllUsers();
        if (response.data) {
          setAllUsers(response.data);
        }
        
        // Get machines directly from API
        try {
          const machinesResponse = await apiService.getAllMachines();
          if (machinesResponse.data && Array.isArray(machinesResponse.data)) {
            console.log("Fetched machines:", machinesResponse.data.length);
            
            // Process machine data, ensuring each machine has a status field
            // Filter out special machines (5 and 6) which are not real machines
            const processedMachines = machinesResponse.data
              .filter(machine => {
                const machineId = machine._id || machine.id;
                return machineId !== '5' && machineId !== '6';
              })
              .map(machine => ({
                ...machine,
                id: machine._id || machine.id, // Ensure id exists
                status: machine.status?.toLowerCase() || 'available'
              }));
            
            console.log("Number of processed machines:", processedMachines.length);
            // Log IDs to debug
            console.log("Machine IDs:", processedMachines.map(m => m.id || m._id));
            
            setMachineData(processedMachines);
          } else {
            console.error("Invalid machine data format:", machinesResponse.data);
          }
        } catch (machinesError) {
          console.error("Error fetching machines:", machinesError);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto page-transition">
      <AdminHeader />
      <StatsOverview allUsers={allUsers} machines={machineData} />
      
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
