
import { useState, useEffect, useCallback } from 'react';
import { machines } from '../../../utils/data';
import userDatabase from '../../../services/userDatabase';

export const useMachineData = (user, navigation) => {
  const [machineData, setMachineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMachineData = async () => {
    console.log("Loading machine data...");
    try {
      setLoading(true);
      console.log("Original machines data:", machines.length, "items");
      
      if (!machines || machines.length === 0) {
        console.error("No machines data available in source");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Filter out safety cabinet completely - it's equipment, not a machine
      const actualMachines = machines.filter(machine => machine.id !== 'safety-cabinet');
      
      const extendedMachines = await Promise.all(actualMachines.map(async (machine) => {
        try {
          console.log("Loading status for machine:", machine.id);
          let status = 'available'; // Default status
          
          try {
            status = await userDatabase.getMachineStatus(machine.id);
            console.log("Status for machine", machine.id, ":", status);
          } catch (statusError) {
            console.error(`Error fetching status for machine ${machine.id}:`, statusError);
            // Leave the default status
          }
          
          return {
            ...machine,
            status: status || 'available'
          };
        } catch (error) {
          console.error(`Error processing machine ${machine.id}:`, error);
          // Always default to available if there's an error
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
      // Fallback - set machines with default status
      console.log("Using fallback machine data");
      const actualMachines = machines.filter(machine => machine.id !== 'safety-cabinet');
      setMachineData(actualMachines.map(machine => ({
        ...machine,
        status: 'available'
      })));
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
