
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import mongoDbService from '../../../services/mongoDbService';

export const useMachineStatusFetcher = (machineData: any[], setMachineData: React.Dispatch<React.SetStateAction<any[]>>) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);

  const checkServerConnection = async () => {
    try {
      console.log("Checking server connection status...");
      const response = await fetch('http://localhost:4000/api/health');
      
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
      await checkServerConnection();
      
      // Get all machine statuses directly from MongoDB
      if (machineData && machineData.length > 0) {
        console.log("Fetching statuses for all machines from MongoDB...");
        
        const updatedMachineData = await Promise.all(
          machineData.map(async (machine) => {
            try {
              const machineId = machine.id || machine._id;
              
              // Use mongoDbService to get machine status directly from MongoDB
              const statusData = await mongoDbService.getMachineStatus(machineId);
              let status = 'available';
              let note = '';
              
              if (statusData) {
                status = statusData.status?.toLowerCase() || 'available';
                note = statusData.note || '';
                console.log(`Got status for machine ${machineId}: ${status}`);
              } else {
                console.log(`No MongoDB status for machine ${machineId}, using default`);
              }
              
              return {
                ...machine,
                status: status,
                maintenanceNote: note
              };
            } catch (error) {
              console.error(`Error fetching status for machine ${machine.id || machine._id}:`, error);
              return machine;
            }
          })
        );
        
        setMachineData(updatedMachineData);
      }
    } catch (error) {
      console.error("Error fetching machine statuses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch machine statuses"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshMachineStatuses = async () => {
    setIsRefreshing(true);
    try {
      await checkServerConnection();
      
      const updatedMachineData = await Promise.all(
        machineData.map(async (machine) => {
          try {
            const machineId = machine.id || machine._id;
            const response = await fetch(`http://localhost:4000/api/machines/${machineId}`);
            
            if (response.ok) {
              const machineData = await response.json();
              return {
                ...machine,
                status: machineData.status?.toLowerCase() || 'available',
                maintenanceNote: machineData.maintenanceNote || ''
              };
            }
            return machine;
          } catch (error) {
            console.error(`Error refreshing machine ${machine.id || machine._id}:`, error);
            return machine;
          }
        })
      );
      
      setMachineData(updatedMachineData);
    } catch (error) {
      console.error("Error refreshing machine statuses:", error);
      toast({
        title: "Error",
        description: "Failed to refresh machine statuses"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch machine statuses on initial load
  useEffect(() => {
    checkServerConnection();
    fetchMachineStatuses();
  }, []);

  return {
    isRefreshing,
    isServerConnected,
    refreshMachineStatuses,
    fetchMachineStatuses
  };
};
