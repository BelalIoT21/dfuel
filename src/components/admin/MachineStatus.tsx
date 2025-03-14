
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench } from "lucide-react";
import userDatabase from '../../services/userDatabase';
import { toast } from '@/components/ui/use-toast';

interface MachineStatusProps {
  machineData: any[];
  setMachineData: React.Dispatch<React.SetStateAction<any[]>>;
}

export const MachineStatus = ({ machineData, setMachineData }: MachineStatusProps) => {
  const [isMachineStatusDialogOpen, setIsMachineStatusDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('available');
  const [maintenanceNote, setMaintenanceNote] = useState('');

  const handleUpdateMachineStatus = (machine: any) => {
    setSelectedMachine(machine);
    setSelectedStatus(machine.status || 'available');
    setMaintenanceNote(machine.maintenanceNote || '');
    setIsMachineStatusDialogOpen(true);
  };

  const saveMachineStatus = async () => {
    if (!selectedMachine) return;
    
    try {
      // Update machine status in the database
      await userDatabase.updateMachineStatus(selectedMachine.id, selectedStatus, maintenanceNote);
      
      // Update local state
      setMachineData(machineData.map(machine => 
        machine.id === selectedMachine.id 
          ? { ...machine, status: selectedStatus, maintenanceNote } 
          : machine
      ));
      
      toast({
        title: "Status Updated",
        description: `${selectedMachine.name} is now ${selectedStatus}`,
      });
      
      setIsMachineStatusDialogOpen(false);
    } catch (error) {
      console.error("Error updating machine status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update machine status",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card className="border-purple-100">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Wrench className="h-5 w-5 text-purple-600" />
            Machine Status
          </CardTitle>
          <CardDescription>Current status of all machines and equipment</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-3">
            {machineData && machineData.length > 0 ? (
              machineData.map((machine) => (
                <div key={machine.id} className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-3 last:border-0 gap-2">
                  <div>
                    <div className="font-medium text-sm">{machine.name}</div>
                    <div className="text-xs text-gray-500">
                      {machine.maintenanceNote ? `Note: ${machine.maintenanceNote}` : 'No maintenance notes'}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      machine.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : machine.status === 'maintenance'
                          ? 'bg-red-100 text-red-800'
                          : machine.status === 'locked'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {machine.status === 'available' 
                        ? 'Available' 
                        : machine.status === 'maintenance'
                          ? 'Maintenance'
                          : machine.status === 'locked'
                            ? 'Locked' 
                            : 'In Use'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs w-full md:w-auto"
                      onClick={() => handleUpdateMachineStatus(machine)}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              ))
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
                  placeholder="Describe the maintenance issue"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMachineStatusDialogOpen(false)} className="border-purple-200 bg-purple-50 hover:bg-purple-100">
              Cancel
            </Button>
            <Button onClick={saveMachineStatus} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
