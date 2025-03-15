
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
      
      // Load status for each machine from MongoDB
      const extendedMachines = await Promise.all(machines.map(async (machine) => {
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
