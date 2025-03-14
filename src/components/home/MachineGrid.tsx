
import React from 'react';
import MachineCard from './MachineCard';

interface ExtendedMachine {
  id: string;
  name: string;
  description: string;
  image: string;
  courseCompleted: boolean;
  quizPassed: boolean;
  status: 'available' | 'maintenance' | 'in-use' | 'locked';
}

interface MachineGridProps {
  machines: ExtendedMachine[];
  userCertifications?: string[];
}

const MachineGrid = ({ machines, userCertifications = [] }: MachineGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {machines.map((machine) => (
        <MachineCard 
          key={machine.id} 
          machine={machine} 
          userCertifications={userCertifications} 
        />
      ))}
    </div>
  );
};

export default MachineGrid;
