
import { useState, useEffect, useCallback } from 'react';
import { machineService } from '../../../services/machineService';
import mongoDbService from '../../../services/mongoDbService';

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
        
        // Map MongoDB IDs to simple IDs for known machines
        if (machineId === "67d5658be9267b302f7aa015") {
          return { ...machine, id: "1", name: "Laser Cutter", type: "Machine" };
        } else if (machineId === "67d5658be9267b302f7aa016") {
          return { ...machine, id: "2", name: "Ultimaker", type: "3D Printer" };
        } else if (machineId === "67d5658be9267b302f7aa017") {
          return { ...machine, id: "4", name: "X1 E Carbon 3D Printer", type: "3D Printer" };
        }
        
        // Apply special handling for machine IDs 1-6
        if (machineId === "1" || machineId === 1) {
          return { ...machine, id: "1", name: "Laser Cutter", type: "Machine" };
        } else if (machineId === "2" || machineId === 2) {
          return { ...machine, id: "2", name: "Ultimaker", type: "3D Printer" };
        } else if (machineId === "3" || machineId === 3) {
          return { ...machine, id: "3", name: "Safety Cabinet", type: "Safety Cabinet" };
        } else if (machineId === "4" || machineId === 4) {
          return { ...machine, id: "4", name: "X1 E Carbon 3D Printer", type: "3D Printer" };
        } else if (machineId === "5" || machineId === 5) {
          return { ...machine, id: "5", name: "Bambu Lab X1 E", type: "3D Printer" };
        } else if (machineId === "6" || machineId === 6) {
          return { ...machine, id: "6", name: "Machine Safety Course", type: "Safety Course" };
        }
        
        return machine;
      });
      
      // Load status for each machine from MongoDB
      const extendedMachines = await Promise.all(mappedMachines.map(async (machine) => {
        try {
          console.log("Loading status for machine:", machine.id);
          // Try to get status directly from MongoDB
          const statusData = await mongoDbService.getMachineStatus(machine.id);
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
      setLoading(false);
      setRefreshing(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("Machine data loading complete");
    }
  };

  useEffect(() => {
    console.log("useMachineData hook effect running");
    console.log("User in hook:", user);
    
    if (user?.isAdmin) {
      console.log("User is admin, navigating to AdminDashboard");
      navigation.replace('AdminDashboard');
      return;
    }
    
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
