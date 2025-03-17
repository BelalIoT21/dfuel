import { useState, useEffect, useCallback } from 'react';
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

  // Check server connection status function
  const checkServerStatus = useCallback(async () => {
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
  }, []);

  // Refresh machine statuses function
  const refreshMachineStatuses = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Check server connection
      const isConnected = await checkServerStatus();
      if (!isConnected) {
        console.log("Server not connected, can't refresh machine statuses");
        setIsRefreshing(false);
        return;
      }
      
      // Get fresh data for each machine directly from the API
      console.log("Fetching updated machine data...");
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/machines`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch machines: ${response.status}`);
      }
      
      const freshMachines = await response.json();
      console.log("Received fresh machine data:", freshMachines.length, "machines");
      
      // Update the machine data state
      setMachineData(freshMachines.map(machine => ({
        ...machine,
        // Use clientStatus if available, otherwise convert status
        status: machine.clientStatus || 
                (machine.status === 'Out of Order' || machine.status === 'In Use' ? 
                'in-use' : machine.status?.toLowerCase() || 'available')
      })));
      
      toast({
        title: "Refreshed",
        description: "Machine statuses have been updated"
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
  }, [checkServerStatus, setMachineData, toast]);

  // Check server connection and set up auto-refresh
  useEffect(() => {
    checkServerStatus();
    const serverCheckInterval = setInterval(checkServerStatus, 5000); // Check every 5 seconds
    
    return () => clearInterval(serverCheckInterval);
  }, [checkServerStatus]);

  // Set up auto-refresh for machine statuses - always enabled
  useEffect(() => {
    // Only auto-refresh if server is connected
    if (!isServerConnected) return;
    
    console.log("Setting up auto-refresh for machine statuses");
    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing machine statuses...");
      refreshMachineStatuses();
    }, 15000); // Auto-refresh every 15 seconds
    
    return () => clearInterval(refreshInterval);
  }, [isServerConnected, refreshMachineStatuses]);

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
        const result = await response.json();
        console.log('Update result:', result);
        
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
        
        // Refresh all machine statuses to ensure everything is in sync
        setTimeout(() => refreshMachineStatuses(), 1000);
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        setUpdateError(`Failed to update machine status: ${errorData.message || 'Unknown error'}`);
        
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
                const machineType = machine.type === "5" || machine._id === "5" ? "Safety Cabinet" : 
                                   machine.type === "6" || machine._id === "6" ? "Safety Course" :
                                   machine.type === "3" || machine._id === "3" ? "X1 E Carbon 3D Printer" : 
                                   machine.type || "Machine";
                
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
                      <span className={`text-xs px-2 py-1 rounded ${
                        machine.status === 'available' || isEquipment
                          ? 'bg-green-100 text-green-800' 
                          : machine.status === 'maintenance'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isEquipment 
                          ? 'Available' 
                          : machine.status === 'available' 
                            ? 'Available' 
                            : machine.status === 'maintenance'
                              ? 'Maintenance'
                              : 'In Use'}
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
