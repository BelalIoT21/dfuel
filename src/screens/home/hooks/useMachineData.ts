
import { useState, useEffect, useCallback } from 'react';
import { machineService } from '../../../services/machineService';
import mongoDbService from '../../../services/mongoDbService';
import { isAndroid, isCapacitor } from '../../../utils/platform';
import { getApiEndpoints } from '../../../utils/env';

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
      
      // Try all possible endpoints for the health check
      const endpoints = getApiEndpoints();
      console.log("Attempting to connect using endpoints:", endpoints);
      
      let isConnected = false;
      
      for (const baseUrl of endpoints) {
        try {
          const healthEndpoint = baseUrl.endsWith('/') 
            ? `${baseUrl}health` 
            : `${baseUrl}/health`;
          
          console.log(`Trying health check at: ${healthEndpoint}?t=${timestamp}`);
          const response = await fetch(`${healthEndpoint}?t=${timestamp}`);
          
          if (response.ok) {
            console.log(`Server connection successful at: ${healthEndpoint}`);
            isConnected = true;
            break;
          }
        } catch (endpointError) {
          console.log(`Health check failed for endpoint: ${baseUrl}`, endpointError);
        }
      }
      
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
      
      // First get all available machines to know which IDs exist in the database
      let machines = [];
      try {
        machines = await machineService.getMachines(timestamp);
        console.log("Fetched machines data:", machines?.length || 0, "items");
      } catch (error) {
        console.error("Error fetching machines:", error);
        machines = [];
      }
      
      if (!machines || machines.length === 0) {
        console.error("No machines data available");
        setLoading(false);
        setRefreshing(false);
        setMachineData([]);
        return;
      }
      
      // Sort machines by ID to ensure consistent ordering
      machines.sort((a, b) => {
        const idA = (a.id || a._id).toString();
        const idB = (b.id || b._id).toString();
        return parseInt(idA) - parseInt(idB);
      });
      
      // Filter out machines with IDs 5 and 6 (safety cabinet and safety course)
      const actualMachines = machines.filter(machine => {
        const id = machine.id || machine._id;
        const stringId = String(id);
        return stringId !== '5' && stringId !== '6';
      });
      
      console.log("Actual machines after filtering safety items:", actualMachines.length);
      
      if (actualMachines.length === 0) {
        console.log("No machines left after filtering");
        setMachineData([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Create an array to hold machines with their statuses
      const machinesWithStatus = [];
      
      // Load status for each machine individually to ensure fresh data
      for (const machine of actualMachines) {
        try {
          const machineId = machine.id || machine._id;
          console.log("Loading status for machine:", machineId);
          
          // Default status
          let status = 'available';
          let maintenanceNote = '';
          
          try {
            // Try to get status from the service
            status = await machineService.getMachineStatus(machineId.toString());
            console.log(`Fetched status for machine ${machineId}:`, status);
            
            // Try to get maintenance note if available
            maintenanceNote = await machineService.getMachineMaintenanceNote(machineId.toString()) || '';
          } catch (statusError) {
            console.error(`Error fetching status for machine ${machineId}:`, statusError);
          }
          
          // Add machine with its status to the array
          machinesWithStatus.push({
            ...machine,
            id: machineId.toString(),
            status: status || 'available',
            maintenanceNote
          });
          
        } catch (error) {
          console.error(`Error processing machine:`, error);
          // Skip this machine
        }
      }
      
      // Sort the machines with status by ID
      machinesWithStatus.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      
      console.log("Machines with status (sorted):", machinesWithStatus.length, "items");
      setMachineData(machinesWithStatus);
    } catch (error) {
      console.error("Error loading machine data:", error);
      setMachineData([]);
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
