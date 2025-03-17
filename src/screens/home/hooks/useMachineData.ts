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
      const response = await fetch('http://localhost:4000/api/health');
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

  const loadMachineData = useCallback(async () => {
    console.log("Loading machine data...");
    try {
      setLoading(true);
      
      // Check server connection first
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        console.log("Server not connected, using cached data if available");
      }
      
      // Use machineService to get machines from MongoDB
      const machines = await machineService.getMachines();
      
      if (!machines || machines.length === 0) {
        console.error("No machines data available from MongoDB");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log("Fetched machines data:", machines.length, "items");
      
      // Process machine data - Use clientStatus if available
      const processedMachines = machines.map(machine => {
        // Use clientStatus if available from the API response
        if (machine.clientStatus) {
          return {
            ...machine,
            status: machine.clientStatus
          };
        }
        
        // Otherwise, convert status manually
        const status = machine.status?.toLowerCase() || 'available';
        return {
          ...machine,
          status: status === 'out of order' || status === 'in use' ? 'in-use' : status
        };
      });
      
      console.log("Processed machines data:", processedMachines.length, "items");
      setMachineData(processedMachines);
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
      loadMachineData();
      
      // Set up auto-refresh interval (every 15 seconds)
      const refreshInterval = setInterval(() => {
        console.log("Auto-refreshing machine data...");
        loadMachineData();
      }, 15000);
      
      // Clean up interval on unmount
      return () => {
        console.log("Cleaning up refresh interval");
        clearInterval(refreshInterval);
      };
    } else {
      console.log("No user found, skipping data load");
      setLoading(false);
    }
  }, [user, navigation, loadMachineData]);

  const onRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    setRefreshing(true);
    loadMachineData();
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
