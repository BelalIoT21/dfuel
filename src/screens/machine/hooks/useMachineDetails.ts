
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { machineService } from '../../../services/machineService';
import mongoDbService from '../../../services/mongoDbService';

export const useMachineDetails = (machineId, user, navigation) => {
  const [machine, setMachine] = useState(null);
  const [machineStatus, setMachineStatus] = useState('available');
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(false);
  const [hasMachineSafetyCert, setHasMachineSafetyCert] = useState(false);

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
        
        // Special handling for Safety Cabinet (ID: 5)
        if (machineId === "5") {
          machineData.type = "Safety Cabinet";
        }
        
        // Special handling for Safety Course (ID: 6)
        if (machineId === "6") {
          machineData.type = "Safety Course";
        }
        
        // Special handling for X1 E Carbon 3D Printer (ID: 3)
        if (machineId === "3") {
          machineData.type = "3D Printer";
        }
        
        // Get machine status from MongoDB
        let status;
        try {
          const statusData = await mongoDbService.getMachineStatus(machineId);
          status = statusData ? statusData.status : 'available';
        } catch (error) {
          console.error('Error getting machine status:', error);
          status = 'available';
        }
        
        setMachineStatus(status);
        setMachine(machineData);
        
        console.log("User certifications:", user.certifications);
        console.log("Checking certification for machineId:", machineId);
        
        // Check if user is certified for this machine
        if (user.certifications && user.certifications.includes(machineId)) {
          console.log("User is certified for this machine");
          setIsCertified(true);
        } else {
          console.log("User is NOT certified for this machine");
          setIsCertified(false);
        }
        
        // Check if user has completed Machine Safety Course
        const MACHINE_SAFETY_ID = "6"; // Machine Safety Course ID
        if (user.certifications && user.certifications.includes(MACHINE_SAFETY_ID)) {
          console.log("User has safety certification");
          setHasMachineSafetyCert(true);
        } else {
          console.log("User does NOT have safety certification");
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
