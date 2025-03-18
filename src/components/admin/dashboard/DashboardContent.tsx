
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../services/apiService';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsOverview } from '@/components/admin/StatsOverview';
import { PlatformOverview } from '@/components/admin/PlatformOverview';
import { QuickActions } from '@/components/admin/QuickActions';
import { PendingActions } from '@/components/admin/PendingActions';
import { MachineStatus } from '@/components/admin/MachineStatus';

// Define consistent machine data
const MACHINE_TYPES = {
  "1": "Laser Cutter",
  "2": "3D Printer",
  "3": "3D Printer",
  "4": "3D Printer",
  "5": "Safety Equipment",
  "6": "Certification"
};

// Define consistent machine names
const MACHINE_NAMES = {
  "1": "Laser Cutter",
  "2": "Ultimaker",
  "3": "X1 E Carbon 3D Printer",
  "4": "Bambu Lab X1 E",
  "5": "Safety Cabinet",
  "6": "Safety Course"
};

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
            // with correct names and types
            const processedMachines = machinesResponse.data.map(machine => {
              const machineId = String(machine._id || machine.id);
              return {
                ...machine,
                id: machineId, // Ensure id exists
                name: MACHINE_NAMES[machineId] || machine.name, // Use correct name
                type: MACHINE_TYPES[machineId] || machine.type || "Machine", // Use correct type
                status: machine.status?.toLowerCase() || 'available'
              };
            });
            
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

  // Create a filtered list of machines for the stats overview
  // that excludes machines 5 and 6 which are special machines (Safety Cabinet and Safety Course)
  const filteredMachines = machineData.filter(machine => {
    const machineId = String(machine._id || machine.id);
    return machineId !== '5' && machineId !== '6';
  });

  return (
    <div className="max-w-7xl mx-auto page-transition">
      <AdminHeader />
      <StatsOverview allUsers={allUsers} machines={filteredMachines} />
      
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
