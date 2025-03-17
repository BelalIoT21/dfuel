
import { useState, useEffect, useCallback } from 'react';
import { machineService } from '../../../services/machineService';
import mongoDbService from '../../../services/mongoDbService';

export const useMachineData = (user, navigation) => {
  const [machineData, setMachineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);

  // Check server connection status
  const checkServerConnection = useCallback(async () => {
    try {
      console.log("Checking server connection status for machine data...");
      const timestamp = new Date().getTime(); // Add timestamp to bypass cache
      const response = await fetch(`http://localhost:4000/api/health?t=${timestamp}`);
      const isConnected = response.ok;
      setIsServerConnected(isConnected);
      console.log("Server connection status:", isConnected ? "Connected" : "Disconnected");
      return isConnected;
    } catch (error) {
      console.error("Error checking server connection:", error);
      setIsServerConnected(false);
      return false;
    }
  }, []);

  const loadMachineData = useCallback(async (force = false) => {
    console.log("Loading machine data, force =", force);
    
    try {
      setLoading(true);
      
      // Check server connection first
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        console.log("Server not connected, using cached data if available");
      }
      
      // Bypass cache by adding timestamp to request
      const timestamp = new Date().getTime();
      const machines = await machineService.getMachines(timestamp);
      
      if (!machines || machines.length === 0) {
        console.error("No machines data available from MongoDB");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log("Fetched machines data:", machines.length, "items");
      
      // Create an array to hold machines with their statuses
      const machinesWithStatus = [];
      
      // Load status for each machine individually to ensure fresh data
      for (const machine of machines) {
        try {
          console.log("Loading status for machine:", machine.id);
          
          // Direct API fetch for each machine to get fresh status
          let status = 'available'; // Default status
          let maintenanceNote = '';
          
          try {
            // Fetch directly from API with cache-busting
            const response = await fetch(`http://localhost:4000/api/machines/${machine.id}?t=${Date.now()}`);
            if (response.ok) {
              const data = await response.json();
              status = data.status || 'available';
              maintenanceNote = data.maintenanceNote || '';
              console.log(`Fetched status for machine ${machine.id}:`, status);
            }
          } catch (apiError) {
            console.error(`API error for machine ${machine.id}:`, apiError);
            
            // Fallback to mongoDbService if API fails
            try {
              const statusData = await mongoDbService.getMachineStatus(machine.id, timestamp);
              status = statusData ? statusData.status : 'available';
              console.log(`Fallback status for machine ${machine.id}:`, status);
            } catch (fallbackError) {
              console.error(`Fallback error for machine ${machine.id}:`, fallbackError);
            }
          }
          
          // Add machine with its status to the array
          machinesWithStatus.push({
            ...machine,
            status: status || 'available',
            maintenanceNote
          });
          
        } catch (error) {
          console.error(`Error loading status for machine ${machine.id}:`, error);
          // Add machine with default status if there was an error
          machinesWithStatus.push({
            ...machine,
            status: 'available'
          });
        }
      }
      
      console.log("Machines with status:", machinesWithStatus.length, "items");
      setMachineData(machinesWithStatus);
    } catch (error) {
      console.error("Error loading machine data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("Machine data loading complete");
    }
  }, [checkServerConnection]);

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
      // Load machine data on initial render with force=true to ensure fresh data
      loadMachineData(true);
    } else {
      console.log("No user found, skipping data load");
      setLoading(false);
    }
  }, [user, navigation, loadMachineData]);

  const onRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    setRefreshing(true);
    loadMachineData(true); // Force refresh
  }, [loadMachineData]);

  return {
    machineData,
    loading,
    refreshing,
    onRefresh,
    loadMachineData,
    isServerConnected
  };
};
