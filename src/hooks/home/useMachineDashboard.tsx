
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { machines } from '../../utils/data';
import userDatabase from '../../services/userDatabase';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface ExtendedMachine {
  id: string;
  name: string;
  description: string;
  image: string;
  courseCompleted: boolean;
  quizPassed: boolean;
  status: 'available' | 'maintenance' | 'in-use' | 'locked';
}

export const useMachineDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [machineData, setMachineData] = useState<ExtendedMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [safetyCourseCompleted, setSafetyCourseCompleted] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin');
      return;
    }
    
    async function loadMachineData() {
      try {
        setLoading(true);
        
        // Check if user has completed the safety course
        const hasSafetyCert = user?.certifications?.includes('safety-course');
        setSafetyCourseCompleted(!!hasSafetyCert);
        
        // Filter out safety cabinet from machine list
        const actualMachines = machines.filter(machine => machine.id !== 'safety-cabinet');
        
        const extendedMachines = await Promise.all(actualMachines.map(async (machine) => {
          try {
            const status = await userDatabase.getMachineStatus(machine.id);
            
            // If safety course is not completed, mark as locked
            let machineStatus: 'available' | 'maintenance' | 'in-use' | 'locked' = 
              (status as 'available' | 'maintenance' | 'in-use') || 'available';
            
            if (!hasSafetyCert) {
              machineStatus = 'locked';
            }
            
            return {
              ...machine,
              status: machineStatus
            };
          } catch (error) {
            console.error(`Error loading status for machine ${machine.id}:`, error);
            return {
              ...machine,
              status: !hasSafetyCert ? 'locked' : 'available'
            };
          }
        }));
        
        setMachineData(extendedMachines);
      } catch (error) {
        console.error("Error loading machine data:", error);
        toast({
          title: "Error",
          description: "Failed to load machine data",
          variant: "destructive"
        });
        
        // Fallback handling - include machines with default statuses
        const machinesWithStatus = actualMachines.map(machine => ({
          ...machine,
          status: !safetyCourseCompleted ? 'locked' : 'available'
        }));
        
        setMachineData(machinesWithStatus);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadMachineData();
    }
  }, [user, navigate, safetyCourseCompleted]);

  return {
    user,
    machineData,
    loading,
    safetyCourseCompleted
  };
};
