
import React from 'react';
import { Button } from "@/components/ui/button";
import { MachineStatusItem } from './MachineStatusItem';

interface MachineStatusListProps {
  machineData: any[];
  handleUpdateMachineStatus: (machine: any) => void;
}

export const MachineStatusList: React.FC<MachineStatusListProps> = ({
  machineData,
  handleUpdateMachineStatus
}) => {
  if (machineData.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">No machines available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {machineData.map((machine) => (
        <MachineStatusItem 
          key={machine.id || machine._id} 
          machine={machine} 
          handleUpdateMachineStatus={handleUpdateMachineStatus}
        />
      ))}
    </div>
  );
};
