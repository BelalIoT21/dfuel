
import { useState, useEffect, useCallback } from 'react';
import { machines } from '../../../utils/data';
import { machineDatabaseService } from '../../../services/database/machineService';

export const useMachineData = (user, navigation) => {
  const [machineData, setMachineData] = useState(
    machines.map(machine => ({
      ...machine,
      status: 'available',
      isLocked: machine.id !== 'safety-cabinet' && 
                user?.certifications && 
                !user.certifications.includes('safety-cabinet')
    }))
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMachineData = useCallback(async () => {
    console.log("Loading machine data...");
    try {
      if (refreshing) return; // Prevent multiple simultaneous refreshes
      
      setLoading(true);
      console.log("Original machines data:", machines.length, "items");
      
      // Always have fallback data
      const fallbackMachines = machines.map(machine => ({
        ...machine,
        status: 'available',
        isLocked: machine.id !== 'safety-cabinet' && 
                  user?.certifications && 
                  !user.certifications.includes('safety-cabinet')
      }));
      
      // Set fallback data immediately to ensure something is shown
      setMachineData(fallbackMachines);
      
      if (!machines || machines.length === 0) {
        console.error("No machines data available in source");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      try {
        // Try to get extended machines info with status
        const statuses = await Promise.all(machines.map(async (machine) => {
          try {
            return await machineDatabaseService.getMachineStatus(machine.id) || 'available';
          } catch (err) {
            console.error(`Failed to get status for ${machine.id}:`, err);
            return 'available';
          }
        }));
        
        // Create extended machines with status info
        const extendedMachines = machines.map((machine, index) => {
          return {
            ...machine,
            status: statuses[index] || 'available',
            isLocked: machine.id !== 'safety-cabinet' && 
                    user?.certifications && 
                    !user.certifications.includes('safety-cabinet')
          };
        });
        
        console.log("Extended machines data:", extendedMachines.length, "items");
        
        // Only update if we successfully got data
        if (extendedMachines && extendedMachines.length > 0) {
          setMachineData(extendedMachines);
        }
      } catch (error) {
        console.error("Error in Promise.all:", error);
        // Fallback already set above
      }
    } catch (error) {
      console.error("Error loading machine data:", error);
      // Keep using the fallback data that was already set
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
    
    // Load machine data
    loadMachineData();
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
