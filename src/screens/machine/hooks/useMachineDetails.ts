
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { machineService } from '../../../services/machineService';
import { certificationService } from '../../../services/certificationService';
import mongoDbService from '../../../services/mongoDbService';

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

export const useMachineDetails = (machineId, user, navigation, forceRefresh = false) => {
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
        
        // Always get fresh machine data from MongoDB through machineService
        console.log(`Loading machine details for ID: ${machineId}, force refresh: ${forceRefresh}`);
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
        
        // Always get fresh machine status from MongoDB
        let status;
        try {
          console.log(`Fetching latest status for machine ${machineId}`);
          const statusData = await mongoDbService.getMachineStatus(machineId);
          status = statusData ? statusData.status : 'available';
          console.log(`Latest status for machine ${machineId}: ${status}`);
        } catch (error) {
          console.error('Error getting machine status:', error);
          status = 'available';
        }
        
        setMachineStatus(status);
        setMachine(machineWithCorrectData);
        
        console.log("User ID for certification check:", user.id);
        
        // Always get fresh certification data from API
        try {
          console.log(`Checking certification for user ${user.id} and machine ${machineId}`);
          const isUserCertified = await certificationService.checkCertification(user.id, machineId);
          console.log("User certification check result:", isUserCertified);
          setIsCertified(isUserCertified);
        } catch (certError) {
          console.error("Error checking certification:", certError);
          // Fallback to user object if API fails
          if (user.certifications && user.certifications.includes(machineId)) {
            setIsCertified(true);
          } else {
            setIsCertified(false);
          }
        }
        
        // Always check for fresh safety course certification
        try {
          console.log(`Checking safety certification for user ${user.id}`);
          const hasSafetyCert = await certificationService.checkCertification(user.id, SAFETY_COURSE_ID);
          console.log("User safety certification check result:", hasSafetyCert);
          setHasMachineSafetyCert(hasSafetyCert);
        } catch (safetyCertError) {
          console.error("Error checking safety certification:", safetyCertError);
          // Fallback to user object if API fails
          if (user.certifications && user.certifications.includes(SAFETY_COURSE_ID)) {
            setHasMachineSafetyCert(true);
          } else {
            setHasMachineSafetyCert(false);
          }
        }
      } catch (error) {
        console.error('Error loading machine details:', error);
        Alert.alert('Error', 'Failed to load machine details');
      } finally {
        setLoading(false);
      }
    };
    
    loadMachineDetails();
  }, [machineId, user, navigation, forceRefresh]);

  return {
    machine,
    machineStatus,
    loading,
    isCertified,
    hasMachineSafetyCert,
    setIsCertified,
    userId: user?.id,
    refreshData: () => {
      setLoading(true);
      // This will trigger the useEffect to run again with a new forceRefresh value
    }
  };
};
