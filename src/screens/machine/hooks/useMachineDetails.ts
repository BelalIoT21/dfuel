
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { machineService } from '../../../services/machineService';
import { certificationService } from '../../../services/certificationService';
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
        
        console.log("User ID for certification check:", user.id);
        
        // Check if user is certified for this machine using API
        try {
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
        
        // Check if user has completed Machine Safety Course
        const MACHINE_SAFETY_ID = "1"; // Machine Safety Course is now Machine 1
        try {
          const hasSafetyCert = await certificationService.checkCertification(user.id, MACHINE_SAFETY_ID);
          console.log("User safety certification check result:", hasSafetyCert);
          setHasMachineSafetyCert(hasSafetyCert);
        } catch (safetyCertError) {
          console.error("Error checking safety certification:", safetyCertError);
          // Fallback to user object if API fails
          if (user.certifications && user.certifications.includes(MACHINE_SAFETY_ID)) {
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
