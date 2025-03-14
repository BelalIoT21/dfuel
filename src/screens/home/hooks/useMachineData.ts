
import { useState, useEffect, useCallback } from 'react';
import { machines } from '../../../utils/data';
import userDatabase from '../../../services/userDatabase';

export const useMachineData = (user, navigation) => {
  const [machineData, setMachineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMachineData = useCallback(async () => {
    console.log("Loading machine data...");
    try {
      if (refreshing) return; // Prevent multiple simultaneous refreshes
      
      setLoading(true);
      console.log("Original machines data:", machines.length, "items");
      
      if (!machines || machines.length === 0) {
        console.error("No machines data available in source");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const extendedMachines = await Promise.all(machines.map(async (machine) => {
        try {
          console.log("Loading status for machine:", machine.id);
          const status = await userDatabase.getMachineStatus(machine.id);
          console.log("Status for machine", machine.id, ":", status);
          
          // Determine if machine is locked (safety course not completed)
          const isLocked = machine.id !== 'safety-cabinet' && 
                          user?.certifications && 
                          !user.certifications.includes('safety-cabinet');
          
          return {
            ...machine,
            status: status || 'available',
            isLocked: isLocked
          };
        } catch (error) {
          console.error(`Error loading status for machine ${machine.id}:`, error);
          return {
            ...machine,
            status: 'available',
            isLocked: machine.id !== 'safety-cabinet' && 
                      user?.certifications && 
                      !user.certifications.includes('safety-cabinet')
          };
        }
      }));
      
      console.log("Extended machines data:", extendedMachines.length, "items");
      setMachineData(extendedMachines);
    } catch (error) {
      console.error("Error loading machine data:", error);
      // Fallback - set machines with default status
      console.log("Using fallback machine data");
      setMachineData(machines.map(machine => ({
        ...machine,
        status: 'available',
        isLocked: machine.id !== 'safety-cabinet' && 
                  user?.certifications && 
                  !user.certifications.includes('safety-cabinet')
      })));
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("Machine data loading complete");
    }
  }, [user, refreshing]);

  useEffect(() => {
    console.log("useMachineData hook effect running");
    console.log("User in hook:", user?.name || "No user");
    
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
  }, [user, navigation, loadMachineData]);

  const onRefresh = useCallback(() => {
    console.log("Refresh triggered");
    setRefreshing(true);
    loadMachineData();
  }, [loadMachineData]);

  return {
    machineData,
    loading,
    refreshing,
    onRefresh,
    loadMachineData
  };
};
