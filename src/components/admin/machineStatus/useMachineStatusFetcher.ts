
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import mongoDbService from '../../../services/mongoDbService';
import { apiService } from '../../../services/apiService';

export const useMachineStatusFetcher = (machineData: any[], setMachineData: React.Dispatch<React.SetStateAction<any[]>>) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);

  const checkServerConnection = async () => {
    try {
      console.log("Checking server connection status...");
      const response = await fetch('http://localhost:4000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
      });
      
      if (response.ok) {
        console.log("Server connected successfully!");
        setIsServerConnected(true);
        return true;
      } else {
        console.log("Server responded with error:", response.status);
        setIsServerConnected(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking server connection:", error);
      setIsServerConnected(false);
      return false;
    }
  };

  const fetchMachineStatuses = async () => {
    setIsRefreshing(true);
    try {
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        console.log("Server not connected, skipping fetch");
        setIsRefreshing(false);
        return;
      }
      
      // Get all machine statuses using the API service
      if (machineData && machineData.length > 0) {
        console.log("Fetching statuses for all machines...");
        
        const updatedMachineData = await Promise.all(
          machineData.map(async (machine) => {
            try {
              const machineId = machine.id || machine._id;
              
              // Use apiService for better error handling and CORS management
              const statusResponse = await apiService.get(`machines/${machineId}`);
              
              if (statusResponse.data) {
                console.log(`Got status for machine ${machineId}:`, statusResponse.data);
                return {
                  ...machine,
                  status: statusResponse.data.status || 'available',
                  maintenanceNote: statusResponse.data.maintenanceNote || ''
                };
              } else {
                console.log(`No status found for machine ${machineId}, using default`);
                return machine;
              }
            } catch (error) {
              console.error(`Error fetching status for machine ${machine.id || machine._id}:`, error);
              return machine;
            }
          })
        );
        
        console.log("Updated machine data:", updatedMachineData);
        setMachineData(updatedMachineData);
      }
    } catch (error) {
      console.error("Error fetching machine statuses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch machine statuses",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshMachineStatuses = async () => {
    setIsRefreshing(true);
    try {
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        toast({
          title: "Server Disconnected",
          description: "Cannot refresh machine statuses while server is disconnected",
          variant: "destructive"
        });
        setIsRefreshing(false);
        return;
      }
      
      // Get all machines from the API
      const response = await apiService.get('machines');
      
      if (response.data) {
        console.log("Received machine data from API:", response.data);
        // Update the machine data with the fresh data from the API
        setMachineData(response.data.map((machine: any) => ({
          ...machine,
          // Ensure status is normalized
          status: machine.status?.toLowerCase() || 'available'
        })));
        
        toast({
          title: "Refreshed",
          description: "Machine statuses updated successfully"
        });
      } else {
        throw new Error("Failed to fetch machines from API");
      }
    } catch (error) {
      console.error("Error refreshing machine statuses:", error);
      toast({
        title: "Error",
        description: "Failed to refresh machine statuses",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch machine statuses on initial load
  useEffect(() => {
    checkServerConnection();
    fetchMachineStatuses();
    
    // Set up periodic refresh every 30 seconds if server is connected
    const intervalId = setInterval(() => {
      if (isServerConnected) {
        console.log("Auto-refreshing machine statuses...");
        fetchMachineStatuses();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [isServerConnected]);

  return {
    isRefreshing,
    isServerConnected,
    refreshMachineStatuses,
    fetchMachineStatuses
  };
};
