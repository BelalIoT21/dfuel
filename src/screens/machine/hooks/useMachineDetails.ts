
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { machineService } from '../../../services/machineService';
import { certificationService } from '../../../services/certificationService';

// Define consistent machine data
const MACHINE_TYPES = {
  "1": "Laser Cutter",
  "2": "3D Printer",
  "3": "3D Printer",
  "4": "3D Printer",
  "5": "Safety Equipment",
  "6": "Certification"
};

// Define consistent machine names
const MACHINE_NAMES = {
  "1": "Laser Cutter",
  "2": "Ultimaker",
  "3": "X1 E Carbon 3D Printer",
  "4": "Bambu Lab X1 E",
  "5": "Safety Cabinet",
  "6": "Safety Course"
};

export const useMachineDetails = (machineId, user, navigation) => {
  const [machine, setMachine] = useState(null);
  const [machineStatus, setMachineStatus] = useState('available');
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(false);
  const [hasMachineSafetyCert, setHasMachineSafetyCert] = useState(false);

  // Safety course has ID 6
  const SAFETY_COURSE_ID = "6";

  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
      return;
    }

    const loadMachineDetails = async () => {
      try {
        setLoading(true);
        
        // Get machine from MongoDB through machineService
        const machineData = await machineService.getMachineById(machineId);
        
        if (!machineData) {
          Alert.alert('Error', 'Machine not found');
          navigation.goBack();
          return;
        }
        
        // Set consistent machine types and names based on ID
        const machineWithCorrectData = {
          ...machineData,
          name: MACHINE_NAMES[machineId] || machineData.name,
          type: MACHINE_TYPES[machineId] || machineData.type || "Machine"
        };
        
        setMachine(machineWithCorrectData);
        
        // Get machine status from the dedicated endpoint or use the status from machine data
        let status;
        try {
          status = await machineService.getMachineStatus(machineId);
        } catch (statusError) {
          console.error('Error getting machine status:', statusError);
          // Use status from machine data as fallback
          console.log('Using status from machine data:', machineWithCorrectData.status);
          status = machineWithCorrectData.status || 'available';
        }
        
        setMachineStatus(status);
        
        console.log("User ID for certification check:", user.id);
        
        // Check if user is certified for this machine using API
        try {
          const isUserCertified = await certificationService.checkCertification(user.id, machineId);
          console.log("User certification check result:", isUserCertified);
          setIsCertified(isUserCertified);
        } catch (certError) {
          console.error("Error checking certification:", certError);
          // Set default to false - no longer using user object as fallback
          setIsCertified(false);
        }
        
        // Check if user has completed Safety Course (ID 6)
        try {
          const hasSafetyCert = await certificationService.checkCertification(user.id, SAFETY_COURSE_ID);
          console.log("User safety certification check result:", hasSafetyCert);
          setHasMachineSafetyCert(hasSafetyCert);
        } catch (safetyCertError) {
          console.error("Error checking safety certification:", safetyCertError);
          // Set default to false - no longer using user object as fallback
          setHasMachineSafetyCert(false);
        }
      } catch (error) {
        console.error('Error loading machine details:', error);
        Alert.alert('Error', 'Failed to load machine details');
      } finally {
        setLoading(false);
      }
    };
    
    loadMachineDetails();
  }, [machineId, user, navigation]);

  return {
    machine,
    machineStatus,
    loading,
    isCertified,
    hasMachineSafetyCert,
    setIsCertified,
    userId: user?.id
  };
};
