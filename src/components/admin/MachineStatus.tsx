
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { MachineStatusCard } from './machineStatus/MachineStatusCard';
import { StatusUpdateDialog } from './machineStatus/StatusUpdateDialog';
import { useMachineStatusFetcher } from './machineStatus/useMachineStatusFetcher';

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
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  const { 
    isRefreshing, 
    isServerConnected, 
    refreshMachineStatuses,
    fetchMachineStatuses
  } = useMachineStatusFetcher(machineData, setMachineData);

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
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/machines/${machineId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: selectedStatus,
          maintenanceNote: maintenanceNote
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Update result:', result);
        
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

  return (
    <>
      <MachineStatusCard
        machineData={machineData}
        isServerConnected={isServerConnected}
        isRefreshing={isRefreshing}
        refreshMachineStatuses={refreshMachineStatuses}
        handleUpdateMachineStatus={handleUpdateMachineStatus}
      />

      <StatusUpdateDialog
        isOpen={isMachineStatusDialogOpen}
        setIsOpen={setIsMachineStatusDialogOpen}
        selectedMachine={selectedMachine}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        maintenanceNote={maintenanceNote}
        setMaintenanceNote={setMaintenanceNote}
        updateError={updateError}
        isLoading={isLoading}
        onSave={saveMachineStatus}
      />
    </>
  );
};
