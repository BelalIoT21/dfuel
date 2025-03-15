
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
        
        // Special handling for machine types based on ID
        if (machineId === "1" || machineId === 1) {
          machineData.type = "Machine";
          machineData.name = "Laser Cutter";
        } else if (machineId === "2" || machineId === 2) {
          machineData.type = "3D Printer";
          machineData.name = "Ultimaker";
        } else if (machineId === "3" || machineId === 3) {
          machineData.type = "Safety Cabinet";
          machineData.name = "Safety Cabinet";
        } else if (machineId === "4" || machineId === 4) {
          machineData.type = "3D Printer";
          machineData.name = "X1 E Carbon 3D Printer";
        } else if (machineId === "5" || machineId === 5) {
          machineData.type = "3D Printer";
          machineData.name = "Bambu Lab X1 E";
        } else if (machineId === "6" || machineId === 6) {
          machineData.type = "Safety Course";
          machineData.name = "Machine Safety Course";
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
        
        // Check if user is certified for this machine - handle string/number ID
        const userCertifications = user.certifications || [];
        const isUserCertified = userCertifications.some(cert => 
          cert === machineId || cert === machineId.toString() || cert === Number(machineId)
        );
        setIsCertified(isUserCertified);
        
        // Check if user has completed Machine Safety Course
        const MACHINE_SAFETY_ID = "6"; // Machine Safety Course ID
        const hasUserSafetyCert = userCertifications.some(cert => 
          cert === MACHINE_SAFETY_ID || cert === 6 || cert === "6"
        );
        setHasMachineSafetyCert(hasUserSafetyCert);
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
