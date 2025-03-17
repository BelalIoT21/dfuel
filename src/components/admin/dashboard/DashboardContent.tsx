
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
  
  useEffect(() => {
    // Load users and machine data
    const fetchData = async () => {
      try {
        // Get all users using our API service
        const response = await apiService.getAllUsers();
        if (response.data) {
          setAllUsers(response.data);
        }
        
        // Initial machine data fetch
        const initialMachineData = machines.map(machine => ({
          ...machine,
          status: 'loading' // Set initial status to loading
        }));
        setMachineData(initialMachineData);
        
        // Get machine statuses
        try {
          console.log("Fetching machine statuses for machines 1-4 on dashboard load");
          const filteredMachines = machines.filter(machine => {
            const machineId = parseInt(machine.id);
            return machineId >= 1 && machineId <= 4; // Only fetch machines 1-4
          });
          
          const updatedMachines = await Promise.all(filteredMachines.map(async (machine) => {
            try {
              const machineId = machine.id;
              const response = await fetch(`http://localhost:4000/api/machines/${machineId}`);
              
              if (response.ok) {
                const machineData = await response.json();
                console.log(`Received initial status for machine ${machineId}:`, machineData.status);
                
                // Ensure we get the correct normalized status
                let status = 'available';
                if (machineData.status) {
                  status = machineData.status.toLowerCase();
                }
                
                return {
                  ...machine,
                  status: status,
                  maintenanceNote: machineData.maintenanceNote || ''
                };
              }
              return machine;
            } catch (error) {
              console.error(`Error fetching status for machine ${machine.id}:`, error);
              return machine;
            }
          }));
          
          // Update only machines 1-4, keep others as they are
          const finalMachineData = initialMachineData.map(machine => {
            const machineId = parseInt(machine.id);
            if (machineId >= 1 && machineId <= 4) {
              const updatedMachine = updatedMachines.find(m => m.id === machine.id);
              return updatedMachine || machine;
            }
            return machine;
          });
          
          setMachineData(finalMachineData);
        } catch (error) {
          console.error("Error fetching machine statuses:", error);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    
    fetchData();
  }, []);

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
