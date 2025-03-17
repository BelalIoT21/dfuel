
import React from 'react';
import { Button } from "@/components/ui/button";

interface MachineStatusItemProps {
  machine: any;
  handleUpdateMachineStatus: (machine: any) => void;
}

export const MachineStatusItem: React.FC<MachineStatusItemProps> = ({
  machine,
  handleUpdateMachineStatus
}) => {
  const isEquipment = machine.type === 'Equipment' || machine.type === 'Safety Cabinet';
  
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
  
  const machineType = getMachineType(machine);
  
  // Normalize status for display
  const normalizeStatus = (status: string | undefined) => {
    if (!status) return 'available';
    
    // Convert any status format to lowercase for consistent display
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus === 'in-use' || lowerStatus === 'in use') {
      return 'in-use';
    } else if (lowerStatus === 'maintenance') {
      return 'maintenance';
    } else {
      return 'available';
    }
  };
  
  const status = normalizeStatus(machine.status);

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-3 last:border-0 gap-2">
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
          status === 'available' || isEquipment
            ? 'bg-green-100 text-green-800' 
            : status === 'maintenance'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isEquipment 
            ? 'Available' 
            : status === 'available' 
              ? 'Available' 
              : status === 'maintenance'
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
};
