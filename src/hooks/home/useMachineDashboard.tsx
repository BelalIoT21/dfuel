
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
  maintenanceNote?: string;
}

export const useMachineDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [machineData, setMachineData] = useState<ExtendedMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [safetyCabinetCompleted, setSafetyCabinetCompleted] = useState(false);
  const [safetyCourseCompleted, setSafetyCourseCompleted] = useState(false);
  const [allSafetyRequirementsMet, setAllSafetyRequirementsMet] = useState(false);

  useEffect(() => {
    console.log("useMachineDashboard useEffect running");
    console.log("User in hook:", user);
    
    if (user?.isAdmin) {
      console.log("User is admin, navigating to AdminDashboard");
      navigate('/admin');
      return;
    }
    
    async function loadMachineData() {
      try {
        console.log("Loading machine data...");
        setLoading(true);
        
        // Check if user has completed both safety requirements
        const hasSafetyCabinetCert = user?.certifications?.includes('safety-cabinet');
        const hasSafetyCourseCert = user?.certifications?.includes('safety-course');
        
        console.log("Safety certifications:", {
          cabinet: hasSafetyCabinetCert,
          course: hasSafetyCourseCert
        });
        
        setSafetyCabinetCompleted(!!hasSafetyCabinetCert);
        setSafetyCourseCompleted(!!hasSafetyCourseCert);
        
        // Both requirements need to be met
        const allRequirementsMet = !!hasSafetyCabinetCert && !!hasSafetyCourseCert;
        setAllSafetyRequirementsMet(allRequirementsMet);
        
        if (!machines || machines.length === 0) {
          console.error("No machines data available");
          setMachineData([]);
          setLoading(false);
          return;
        }
        
        const extendedMachines = await Promise.all(machines.map(async (machine) => {
          try {
            console.log("Processing machine:", machine.id);
            const status = await userDatabase.getMachineStatus(machine.id);
            const maintenanceNote = await userDatabase.getMachineMaintenanceNote(machine.id);
            
            // If both safety requirements are not met and it's not one of the safety items itself, mark as locked
            let machineStatus: 'available' | 'maintenance' | 'in-use' | 'locked' = 
              (status as 'available' | 'maintenance' | 'in-use') || 'available';
            
            if (!allRequirementsMet && 
                machine.id !== 'safety-cabinet' && 
                machine.id !== 'safety-course') {
              machineStatus = 'locked';
            }
            
            return {
              ...machine,
              status: machineStatus,
              maintenanceNote
            };
          } catch (error) {
            console.error(`Error loading status for machine ${machine.id}:`, error);
            return {
              ...machine,
              status: !allRequirementsMet && 
                      machine.id !== 'safety-cabinet' && 
                      machine.id !== 'safety-course' ? 'locked' : 'available'
            };
          }
        }));
        
        console.log("Extended machines data:", extendedMachines);
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
          status: !allSafetyRequirementsMet && 
                  machine.id !== 'safety-cabinet' && 
                  machine.id !== 'safety-course' ? 'locked' : 'available'
        })));
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadMachineData();
    }
  }, [user, navigate, allSafetyRequirementsMet]);

  return {
    user,
    machineData,
    loading,
    safetyCabinetCompleted,
    safetyCourseCompleted,
    allSafetyRequirementsMet
  };
};
