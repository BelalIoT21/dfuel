
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { machineService } from '../../services/machineService';
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, WifiOff, Check, AlertTriangle } from "lucide-react";
import { apiService } from '../../services/apiService';

interface MachineStatusProps {
  machineData: any[];
  setMachineData: React.Dispatch<React.SetStateAction<any[]>>;
}

export const MachineStatus = ({ machineData, setMachineData }: MachineStatusProps) => {
  const { toast } = useToast();
  const [isMachineStatusDialogOpen, setIsMachineStatusDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('available');
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Check server connection status and load machine statuses on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // First check server connection
        console.log("Checking server connection status...");
        const response = await fetch('http://localhost:4000/api/health');
        
        if (response.ok) {
          console.log("Server connected successfully!");
          setIsServerConnected(true);
          
          // Server is connected, fetch fresh machine statuses
          await fetchMachineStatuses();
        } else {
          console.log("Server responded with error:", response.status);
          setIsServerConnected(false);
        }
      } catch (error) {
        console.error("Error during initial data load:", error);
        setIsServerConnected(false);
      } finally {
        setInitialLoadDone(true);
      }
    };
    
    loadInitialData();
  }, []);

  // Fetch machine statuses function that can be called on load and refresh
  const fetchMachineStatuses = async () => {
    console.log("Fetching fresh machine statuses...");
    
    try {
      // Only load status for machines 1 to 4
      const machineIds = ["1", "2", "3", "4"];
      
      // Track updated machines
      const updatedMachines = [];
      
      // Get fresh status for each machine directly from the API
      for (const machineId of machineIds) {
        try {
          // Use direct fetch to ensure we get latest status
          const response = await fetch(`http://localhost:4000/api/machines/${machineId}`);
          
          if (response.ok) {
            const machineData = await response.json();
            console.log(`Machine ${machineId} status:`, machineData.status);
            
            // Store machine data with properly formatted status
            updatedMachines.push({
              id: machineId,
              _id: machineId, // Include both forms of ID for compatibility
              name: machineData.name,
              type: machineData.type || "Machine",
              status: machineData.status?.toLowerCase() || 'available',
              maintenanceNote: machineData.maintenanceNote || ''
            });
          } else {
            console.error(`Error fetching machine ${machineId}:`, response.statusText);
          }
        } catch (error) {
          console.error(`Error fetching machine ${machineId}:`, error);
        }
      }
      
      if (updatedMachines.length > 0) {
        // Update machine data with the new status information
        setMachineData(prevData => {
          // Create a map of existing machines for efficient lookup
          const existingMachines = {};
          prevData.forEach(machine => {
            const id = machine.id || machine._id;
            existingMachines[id] = machine;
          });
          
          // Update existing machines with new data
          const result = [...prevData];
          updatedMachines.forEach(updatedMachine => {
            const machineId = updatedMachine.id || updatedMachine._id;
            const index = result.findIndex(m => 
              (m.id === machineId || m._id === machineId)
            );
            
            if (index !== -1) {
              // Update existing machine
              result[index] = {
                ...result[index],
                status: updatedMachine.status,
                maintenanceNote: updatedMachine.maintenanceNote
              };
            }
          });
          
          console.log("Updated machine data:", result);
          return result;
        });
        
        console.log("Machine statuses updated successfully");
      } else {
        console.warn("No machine data was retrieved from the server");
      }
    } catch (error) {
      console.error("Error fetching machine statuses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch machine statuses"
      });
    }
  };

  const sortedMachineData = [...machineData].sort((a, b) => {
    if (a.type === 'Equipment' || a.type === 'Safety Cabinet') return 1;
    if (b.type === 'Equipment' || b.type === 'Safety Cabinet') return -1;
    return 0;
  });

  const handleUpdateMachineStatus = (machine: any) => {
    setSelectedMachine(machine);
    setSelectedStatus(machine.status || 'available');
    setMaintenanceNote(machine.maintenanceNote || '');
    setUpdateError(null);
    setIsMachineStatusDialogOpen(true);
  };

  const refreshMachineStatuses = async () => {
    setIsRefreshing(true);
    try {
      // Check server connection
      try {
        const response = await fetch('http://localhost:4000/api/health');
        setIsServerConnected(response.ok);
      } catch (error) {
        console.error("Error checking server connection:", error);
        setIsServerConnected(false);
      }
      
      // Fetch fresh machine statuses
      await fetchMachineStatuses();
      
      toast({
        title: "Refreshed",
        description: "Machine statuses have been refreshed"
      });
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

  const saveMachineStatus = async () => {
    if (!selectedMachine) return;
    
    setIsLoading(true);
    setUpdateError(null);
    
    try {
      console.log(`Updating machine ${selectedMachine.id || selectedMachine._id} status to ${selectedStatus}`);
      
      const machineId = selectedMachine.id || selectedMachine._id;
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      // Use direct fetch to update machine status
      const response = await fetch(`http://localhost:4000/api/machines/${machineId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the auth token
        },
        body: JSON.stringify({
          status: selectedStatus,
          maintenanceNote: maintenanceNote
        }),
      });
      
      if (response.ok) {
        const responseText = await response.text();
        let responseData;
        try {
          // Only try to parse as JSON if the response is not empty
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.warn('Unable to parse response as JSON:', responseText);
          responseData = { message: responseText };
        }
        console.log('Update result:', responseData);
        
        // Update the machine data in state
        setMachineData(machineData.map(machine => 
          (machine.id === machineId || machine._id === machineId)
            ? { 
                ...machine, 
                status: selectedStatus, 
                maintenanceNote: maintenanceNote 
              } 
            : machine
        ));
        
        toast({
          title: "Status Updated",
          description: `${selectedMachine.name} status has been updated to ${selectedStatus}`
        });
        
        setIsMachineStatusDialogOpen(false);
      } else {
        const statusCode = response.status;
        let errorMessage = `Request failed with status: ${statusCode}`;
        
        // For rate limit errors, show a specific message
        if (statusCode === 429) {
          errorMessage = "Rate limit exceeded. Please wait before trying again.";
        } else {
          // Try to parse error message from JSON response, but handle non-JSON responses
          try {
            const responseText = await response.text();
            if (responseText) {
              try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorMessage;
              } catch (parseError) {
                // If it's not JSON, use the text directly
                errorMessage = responseText;
              }
            }
          } catch (e) {
            console.error("Error reading response:", e);
          }
        }
        
        console.error('Update failed:', errorMessage);
        setUpdateError(`Failed to update machine status: ${errorMessage}`);
        
        toast({
          title: "Update Failed",
          description: "Server reported an error while updating machine status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating machine status:", error);
      setUpdateError("Connection error while updating the machine status");
      
      toast({
        title: "Error",
        description: "Connection error occurred while updating machine status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMachineType = (machine: any) => {
    if (machine.id === "5" || machine._id === "5") {
      return "Safety Cabinet";
    } else if (machine.id === "6" || machine._id === "6") {
      return "Safety Course";
    } else if (machine.id === "3" || machine._id === "3") {
      return "X1 E Carbon 3D Printer";
    }
    
    return machine.type || "Machine";
  };

  // Function to correctly display machine status
  const getStatusDisplay = (machine: any) => {
    // Special case for equipment
    const isEquipment = machine.type === 'Equipment' || machine.type === 'Safety Cabinet';
    if (isEquipment) {
      return {
        text: 'Available',
        className: 'bg-green-100 text-green-800'
      };
    }
    
    // Regular machine status display
    const status = machine.status?.toLowerCase() || 'available';
    
    if (status === 'available') {
      return {
        text: 'Available',
        className: 'bg-green-100 text-green-800'
      };
    } else if (status === 'maintenance') {
      return {
        text: 'Maintenance',
        className: 'bg-red-100 text-red-800'
      };
    } else {
      return {
        text: 'In Use',
        className: 'bg-yellow-100 text-yellow-800'
      };
    }
  };

  return (
    <>
      <Card className="border-purple-100">
        <CardHeader className="p-4 md:p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              Machine Status
            </CardTitle>
            <div className="flex items-center gap-2">
              {isServerConnected ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Server: Connected
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded flex items-center">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Server: Disconnected
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshMachineStatuses}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} mr-2`} />
                Refresh
              </Button>
            </div>
          </div>
          <CardDescription>Current status of all machines</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-3">
            {sortedMachineData.length > 0 ? (
              sortedMachineData.map((machine) => {
                const isEquipment = machine.type === 'Equipment' || machine.type === 'Safety Cabinet';
                const machineType = getMachineType(machine);
                const statusDisplay = getStatusDisplay(machine);
                
                return (
                  <div key={machine.id || machine._id} className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-3 last:border-0 gap-2">
                    <div>
                      <div className="font-medium text-sm">
                        {machine.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Type: {machineType}
                        {!isEquipment && machine.maintenanceNote ? ` - Note: ${machine.maintenanceNote}` : ''}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${statusDisplay.className}`}>
                        {statusDisplay.text}
                      </span>
                      {!isEquipment && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs w-full md:w-auto"
                          onClick={() => handleUpdateMachineStatus(machine)}
                        >
                          Update
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No machines available yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isMachineStatusDialogOpen} onOpenChange={setIsMachineStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Update Machine Status</DialogTitle>
            <DialogDescription>
              Change the current status of {selectedMachine?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="machine-status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="machine-status" className="bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="available">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Available
                    </span>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                      Maintenance
                    </span>
                  </SelectItem>
                  <SelectItem value="in-use">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                      In Use
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedStatus === 'maintenance' && (
              <div className="space-y-2">
                <Label htmlFor="maintenance-note">Maintenance Note</Label>
                <Input
                  id="maintenance-note"
                  value={maintenanceNote}
                  onChange={(e) => setMaintenanceNote(e.target.value)}
                  placeholder="Optional: Describe the maintenance issue"
                />
              </div>
            )}
            
            {updateError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{updateError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMachineStatusDialogOpen(false)} className="border-purple-200 bg-purple-50 hover:bg-purple-100">
              Cancel
            </Button>
            <Button 
              onClick={saveMachineStatus} 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
