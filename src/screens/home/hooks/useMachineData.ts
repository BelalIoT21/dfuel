
import { useState, useEffect, useCallback } from 'react';
import { machineService } from '../../../services/machineService';
import mongoDbService from '../../../services/mongoDbService';

export const useMachineData = (user, navigation) => {
  const [machineData, setMachineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

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
    
    // Don't refresh if we just did so recently (within 1 second), unless forced
    const now = new Date();
    const timeSinceLastRefresh = now.getTime() - lastRefreshTime.getTime();
    if (!force && timeSinceLastRefresh < 1000) {
      console.log("Skipping refresh, too soon since last refresh");
      return;
    }
    
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
      
      // Load status for each machine from MongoDB, also bypassing cache
      const extendedMachines = await Promise.all(machines.map(async (machine) => {
        try {
          console.log("Loading status for machine:", machine.id);
          // Try to get status directly from MongoDB or API with cache bypass
          const statusData = await mongoDbService.getMachineStatus(machine.id, timestamp);
          
          // Get status, default to 'available' if not found
          let status = statusData ? statusData.status : 'available';
          
          // Make sure "out of order" is converted to "in-use" for client display
          if (status && (status.toLowerCase() === 'out of order' || status.toLowerCase() === 'maintenance')) {
            status = 'in-use';
          }
          
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
      setLastRefreshTime(now);
    } catch (error) {
      console.error("Error loading machine data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("Machine data loading complete");
    }
  }, [checkServerConnection, lastRefreshTime]);

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
      // Force load on initial render and login
      loadMachineData(true);
      
      // Set up auto-refresh interval (every 10 seconds)
      const refreshInterval = setInterval(() => {
        console.log("Auto-refreshing machine data...");
        loadMachineData(true);
      }, 10000);
      
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
