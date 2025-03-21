
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

export const useMachineDetails = (machineId, user, navigation, forceRefresh = 0) => {
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
        console.log(`Loading machine details for ID: ${machineId}, force refresh: ${forceRefresh}`);
        
        // Fetch machine from API
        let machineData;
        try {
          console.log('Fetching machine directly from API');
          machineData = await machineService.getMachineById(machineId);
          
          if (!machineData) {
            console.error(`Machine not found for ID ${machineId}`);
            Alert.alert('Error', 'Machine not found');
            navigation.goBack();
            return;
          }
          
          console.log('Successfully retrieved machine data:', machineData);
        } catch (error) {
          console.error('Error fetching machine:', error);
          Alert.alert('Error', 'Failed to load machine details');
          navigation.goBack();
          return;
        }
        
        // Set consistent machine types and names based on ID
        const machineWithCorrectData = {
          ...machineData,
          name: MACHINE_NAMES[machineId] || machineData.name,
          type: MACHINE_TYPES[machineId] || machineData.type || "Machine"
        };
        
        // Get fresh machine status from API
        let status;
        try {
          console.log(`Fetching latest status for machine ${machineId}`);
          status = await machineService.getMachineStatus(machineId);
          console.log(`Latest status for machine ${machineId}: ${status}`);
        } catch (error) {
          console.error('Error getting machine status:', error);
          status = 'available';
        }
        
        setMachineStatus(status);
        setMachine(machineWithCorrectData);
        
        console.log("User ID for certification check:", user.id);
        
        // Get fresh certification data from API
        try {
          console.log(`Checking certification directly for user ${user.id} and machine ${machineId}`);
          const isUserCertified = await certificationService.checkCertification(user.id, machineId);
          console.log("User certification check result:", isUserCertified);
          setIsCertified(isUserCertified);
        } catch (certError) {
          console.error("Error checking certification:", certError);
          setIsCertified(false);
        }
        
        // Check for safety course certification
        try {
          console.log(`Checking safety certification for user ${user.id}`);
          const hasSafetyCert = await certificationService.checkCertification(user.id, SAFETY_COURSE_ID);
          console.log("User safety certification check result:", hasSafetyCert);
          setHasMachineSafetyCert(hasSafetyCert);
        } catch (safetyCertError) {
          console.error("Error checking safety certification:", safetyCertError);
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
