
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
        const hasSafetyCert = user?.safetyCoursesCompleted?.includes('safety-course');
        setSafetyCourseCompleted(!!hasSafetyCert);
        
        const extendedMachines = await Promise.all(machines.map(async (machine) => {
          try {
            const status = await userDatabase.getMachineStatus(machine.id);
            
            // If safety course is not completed and it's not the safety cabinet itself, mark as locked
            let machineStatus: 'available' | 'maintenance' | 'in-use' | 'locked' = 
              (status as 'available' | 'maintenance' | 'in-use') || 'available';
            
            if (!hasSafetyCert && machine.id !== 'safety-cabinet') {
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
              status: !hasSafetyCert && machine.id !== 'safety-cabinet' ? 'locked' : 'available'
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
        setMachineData(machines.map(machine => ({
          ...machine,
          status: !safetyCourseCompleted && machine.id !== 'safety-cabinet' ? 'locked' : 'available'
        })));
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
