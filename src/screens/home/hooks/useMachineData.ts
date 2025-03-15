
import { useState, useEffect, useCallback } from 'react';
import { machineService } from '../../../services/machineService';
import mongoDbService from '../../../services/mongoDbService';

// Define a mapping for machine IDs to names and types
const machineMapping = {
  "1": { name: "Laser Cutter", type: "Machine" },
  "2": { name: "Ultimaker", type: "3D Printer" },
  "3": { name: "Safety Cabinet", type: "Safety Cabinet" },
  "4": { name: "X1 E Carbon 3D Printer", type: "3D Printer" },
  "5": { name: "Bambu Lab X1 E", type: "3D Printer" },
  "6": { name: "Machine Safety Course", type: "Safety Course" },
  // MongoDB ObjectIDs mapped to simple IDs
  "67d5658be9267b302f7aa015": { name: "Laser Cutter", type: "Machine", simpleId: "1" },
  "67d5658be9267b302f7aa016": { name: "Ultimaker", type: "3D Printer", simpleId: "2" },
  "67d5658be9267b302f7aa017": { name: "X1 E Carbon 3D Printer", type: "3D Printer", simpleId: "4" }
};

export const useMachineData = (user, navigation) => {
  const [machineData, setMachineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMachineData = async () => {
    console.log("Loading machine data...");
    try {
      setLoading(true);
      
      // Use machineService to get machines from MongoDB
      const machines = await machineService.getMachines();
      
      if (!machines || machines.length === 0) {
        console.error("No machines data available from MongoDB");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log("Fetched machines data:", machines.length, "items");
      
      // Apply fixed names and types for specific machine IDs
      const mappedMachines = machines.map(machine => {
        const machineId = machine.id || machine._id;
        const machineIdStr = String(machineId);
        
        // Check if this machine ID is in our mapping
        if (machineMapping[machineIdStr]) {
          const mappedData = machineMapping[machineIdStr];
          return { 
            ...machine, 
            id: mappedData.simpleId || machineIdStr, 
            name: mappedData.name, 
            type: mappedData.type 
          };
        }
        
        return machine;
      });
      
      // Load status for each machine from MongoDB
      const extendedMachines = await Promise.all(mappedMachines.map(async (machine) => {
        try {
          console.log("Loading status for machine:", machine.id);
          // Try to get status directly from MongoDB
          const statusData = await machineService.getMachineStatus(machine.id);
          const status = statusData ? statusData.status : 'available';
          console.log("Status for machine", machine.id, ":", status);
          return {
            ...machine,
            status: status || 'available'
          };
        } catch (error) {
          console.error(`Error loading status for machine ${machine.id}:`, error);
          return {
            ...machine,
            status: 'available'
          };
        }
      }));
      
      console.log("Extended machines data:", extendedMachines.length, "items");
      setMachineData(extendedMachines);
    } catch (error) {
      console.error("Error loading machine data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("Machine data loading complete");
    }
  };

  useEffect(() => {
    console.log("useMachineData hook effect running");
    console.log("User in hook:", user);
    
    // Only navigate admin users away if they aren't explicitly trying to access the Home screen
    // This allows admins to still use the Home screen when they want to
    
    if (user) {
      console.log("User is authenticated, loading machine data");
      loadMachineData();
    } else {
      console.log("No user found, skipping data load");
      setLoading(false);
    }
  }, [user, navigation]);

  const onRefresh = useCallback(() => {
    console.log("Refresh triggered");
    setRefreshing(true);
    loadMachineData();
  }, []);

  return {
    machineData,
    loading,
    refreshing,
    onRefresh,
    loadMachineData
  };
};
