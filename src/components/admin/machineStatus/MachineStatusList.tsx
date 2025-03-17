
import React from 'react';
import { MachineStatusItem } from './MachineStatusItem';

interface MachineStatusListProps {
  machineData: any[];
  handleUpdateMachineStatus: (machine: any) => void;
}

export const MachineStatusList: React.FC<MachineStatusListProps> = ({
  machineData,
  handleUpdateMachineStatus
}) => {
  if (!machineData || machineData.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">No machines available yet.</p>
      </div>
    );
  }

  // Sort machines to put maintenance ones at the top
  const sortedMachineData = [...machineData].sort((a, b) => {
    // First sort by equipment type (machines first, equipment last)
    const aIsEquipment = a.type === 'Equipment' || a.type === 'Safety Cabinet';
    const bIsEquipment = b.type === 'Equipment' || b.type === 'Safety Cabinet';
    
    if (aIsEquipment && !bIsEquipment) return 1;
    if (!aIsEquipment && bIsEquipment) return -1;
    
    // Then sort by status (maintenance first, then in-use, then available)
    const aStatus = a.status?.toLowerCase() || 'available';
    const bStatus = b.status?.toLowerCase() || 'available';
    
    if (aStatus === 'maintenance' && bStatus !== 'maintenance') return -1;
    if (aStatus !== 'maintenance' && bStatus === 'maintenance') return 1;
    
    if (aStatus === 'in-use' && bStatus === 'available') return -1;
    if (aStatus === 'available' && bStatus === 'in-use') return 1;
    
    // Finally sort by name
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="space-y-3">
      {sortedMachineData.map((machine) => (
        <MachineStatusItem 
          key={machine.id || machine._id} 
          machine={machine} 
          handleUpdateMachineStatus={handleUpdateMachineStatus}
        />
      ))}
    </div>
  );
};
