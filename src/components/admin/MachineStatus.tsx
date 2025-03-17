
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { machineService } from '../../services/machineService';
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, WifiOff } from "lucide-react";
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

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await apiService.checkHealth();
        setIsServerConnected(!!response.data);
      } catch (error) {
        setIsServerConnected(false);
      }
    };
    
    checkServerStatus();
    const intervalId = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const sortedMachineData = [...machineData].sort((a, b) => {
    if (a.type === 'Equipment' || a.type === 'Safety Cabinet') return 1;
    if (b.type === 'Equipment' || b.type === 'Safety Cabinet') return -1;
    return 0;
  });

  const handleUpdateMachineStatus = (machine: any) => {
    setSelectedMachine(machine);
    setSelectedStatus(machine.status || 'available');
    setMaintenanceNote(machine.maintenanceNote || '');
    setIsMachineStatusDialogOpen(true);
  };

  const refreshMachineStatuses = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await apiService.checkHealth();
      setIsServerConnected(!!response.data);
      
      toast({
        title: "Refreshed",
        description: "Machine statuses have been refreshed"
      });
    } catch (error) {
      console.error("Error refreshing machine statuses:", error);
      setIsServerConnected(false);
      toast({
        title: "Error",
        description: "Failed to refresh machine statuses"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const saveMachineStatus = async () => {
    if (!selectedMachine) return;
    
    setIsLoading(true);
    
    try {
      console.log(`Updating machine ${selectedMachine.id} status to ${selectedStatus}`);
      
      const success = await machineService.updateMachineStatus(
        selectedMachine.id, 
        selectedStatus,
        maintenanceNote
      );
      
      if (success) {
        console.log(`Successfully updated machine ${selectedMachine.id} status`);
        
        setMachineData(machineData.map(machine => 
          machine.id === selectedMachine.id 
            ? { ...machine, status: selectedStatus, maintenanceNote: maintenanceNote } 
            : machine
        ));
        
        toast({
          title: "Status Updated",
          description: `${selectedMachine.name} status has been updated to ${selectedStatus}`
        });
      } else {
        console.error(`Failed to update machine ${selectedMachine.id} status`);
        toast({
          title: "Update Failed",
          description: "Failed to update machine status. Please try again."
        });
      }
    } catch (error) {
      console.error("Error updating machine status:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the machine status"
      });
    } finally {
      setIsLoading(false);
      setIsMachineStatusDialogOpen(false);
    }
  };

  const getMachineType = (machine) => {
    if (machine.id === "5") {
      return "Safety Cabinet";
    } else if (machine.id === "6") {
      return "Safety Course";
    } else if (machine.id === "3") {
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
              {/* Fixed server status indicator styling */}
              <span className={isServerConnected ? 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded' : 'bg-red-100 text-red-800 text-xs px-2 py-1 rounded'}>
                Server status: {isServerConnected ? 'Connected' : 'Disconnected'}
                {!isServerConnected && <WifiOff className="h-3 w-3 ml-1 inline" />}
              </span>
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
                
                return (
                  <div key={machine.id} className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-3 last:border-0 gap-2">
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
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
