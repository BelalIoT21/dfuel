
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../services/apiService';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsOverview } from '@/components/admin/StatsOverview';
import { PlatformOverview } from '@/components/admin/PlatformOverview';
import { QuickActions } from '@/components/admin/QuickActions';
import { PendingActions } from '@/components/admin/PendingActions';
import { MachineStatus } from '@/components/admin/MachineStatus';
import mongoDbService from '@/services/mongoDbService';

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
  const [authError, setAuthError] = useState(false);
  
  // Safely use Auth context with error handling
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (error) {
    console.error('Error accessing Auth context in DashboardContent:', error);
    setAuthError(true);
  }
  
  useEffect(() => {
    // Load users and machine data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First try to get dashboard data from admin API
        try {
          const dashboardResponse = await apiService.getAdminDashboard();
          console.log("Dashboard response:", dashboardResponse);
          
          if (dashboardResponse.data) {
            // Set users from dashboard data
            if (dashboardResponse.data.recentUsers) {
              setAllUsers(dashboardResponse.data.recentUsers);
            }
          }
        } catch (dashboardError) {
          console.error("Error fetching dashboard data:", dashboardError);
        }
        
        // If we didn't get users from dashboard, try direct user API
        if (allUsers.length === 0) {
          try {
            console.log("Fetching users directly from API");
            const timestamp = new Date().getTime();
            const usersResponse = await apiService.request(`users?t=${timestamp}`, 'GET');
            if (usersResponse?.data && Array.isArray(usersResponse.data)) {
              console.log(`Fetched ${usersResponse.data.length} users from API`);
              setAllUsers(usersResponse.data);
            } else {
              // Try MongoDB as final fallback for users
              console.log("API failed, trying MongoDB for users");
              const mongoUsers = await mongoDbService.getAllUsers();
              if (Array.isArray(mongoUsers) && mongoUsers.length > 0) {
                setAllUsers(mongoUsers);
              }
            }
          } catch (userApiError) {
            console.error("Error fetching users from API:", userApiError);
            // Final fallback - MongoDB
            try {
              console.log("Trying MongoDB for users after API failure");
              const mongoUsers = await mongoDbService.getAllUsers();
              if (Array.isArray(mongoUsers) && mongoUsers.length > 0) {
                setAllUsers(mongoUsers);
              }
            } catch (mongoError) {
              console.error("MongoDB user fetch error:", mongoError);
            }
          }
        }
        
        // Get machines directly from API with timestamp to prevent caching
        try {
          const timestamp = new Date().getTime();
          const machinesResponse = await apiService.request(`machines?t=${timestamp}`, 'GET');
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
            
            // Try MongoDB as fallback
            console.log("Trying MongoDB for machines");
            const mongoMachines = await mongoDbService.getAllMachines();
            if (Array.isArray(mongoMachines) && mongoMachines.length > 0) {
              // Process machine data from MongoDB
              const processedMachines = mongoMachines.map(machine => {
                const machineId = String(machine._id || machine.id);
                return {
                  ...machine,
                  id: machineId,
                  name: MACHINE_NAMES[machineId] || machine.name,
                  type: MACHINE_TYPES[machineId] || machine.type || "Machine",
                  status: machine.status?.toLowerCase() || 'available'
                };
              });
              setMachineData(processedMachines);
            }
          }
        } catch (machinesError) {
          console.error("Error fetching machines:", machinesError);
          
          // Try MongoDB as fallback
          try {
            console.log("Trying MongoDB for machines after API error");
            const mongoMachines = await mongoDbService.getAllMachines();
            if (Array.isArray(mongoMachines) && mongoMachines.length > 0) {
              // Process machine data from MongoDB
              const processedMachines = mongoMachines.map(machine => {
                const machineId = String(machine._id || machine.id);
                return {
                  ...machine,
                  id: machineId,
                  name: MACHINE_NAMES[machineId] || machine.name,
                  type: MACHINE_TYPES[machineId] || machine.type || "Machine",
                  status: machine.status?.toLowerCase() || 'available'
                };
              });
              setMachineData(processedMachines);
            }
          } catch (mongoError) {
            console.error("MongoDB machine fetch error:", mongoError);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authError) {
      fetchData();
    }
  }, [authError]);

  // Show loading or error state
  if (authError) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
        <p className="text-gray-700">Unable to access admin dashboard. Please refresh or log in again.</p>
      </div>
    );
  }

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
