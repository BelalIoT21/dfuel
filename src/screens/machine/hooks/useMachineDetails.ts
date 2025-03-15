
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
        if (machineId === "1" || machineId === 1 || machineId === "67d5658be9267b302f7aa015") {
          machineData.type = "Machine";
          machineData.name = "Laser Cutter";
          machineData.id = "1";
        } else if (machineId === "2" || machineId === 2 || machineId === "67d5658be9267b302f7aa016") {
          machineData.type = "3D Printer";
          machineData.name = "Ultimaker";
          machineData.id = "2";
        } else if (machineId === "3" || machineId === 3) {
          machineData.type = "Safety Cabinet";
          machineData.name = "Safety Cabinet";
          machineData.id = "3";
        } else if (machineId === "4" || machineId === 4 || machineId === "67d5658be9267b302f7aa017") {
          machineData.type = "3D Printer";
          machineData.name = "X1 E Carbon 3D Printer";
          machineData.id = "4";
        } else if (machineId === "5" || machineId === 5) {
          machineData.type = "3D Printer";
          machineData.name = "Bambu Lab X1 E";
          machineData.id = "5";
        } else if (machineId === "6" || machineId === 6) {
          machineData.type = "Safety Course";
          machineData.name = "Machine Safety Course";
          machineData.id = "6";
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
        
        // Check if user is certified for this machine - handle string/number ID and MongoDB ObjectIds
        const userCertifications = user.certifications || [];
        const isUserCertified = userCertifications.some(cert => {
          const certStr = cert.toString();
          const machineIdStr = machineId.toString();
          
          // Check for direct match
          if (certStr === machineIdStr) return true;
          
          // Special case for MongoDB IDs to normal IDs
          if (machineIdStr === "1" && certStr === "67d5658be9267b302f7aa015") return true;
          if (machineIdStr === "2" && certStr === "67d5658be9267b302f7aa016") return true;
          if (machineIdStr === "4" && certStr === "67d5658be9267b302f7aa017") return true;
          
          // Special case for normal IDs to MongoDB IDs
          if (certStr === "1" && machineIdStr === "67d5658be9267b302f7aa015") return true;
          if (certStr === "2" && machineIdStr === "67d5658be9267b302f7aa016") return true;
          if (certStr === "4" && machineIdStr === "67d5658be9267b302f7aa017") return true;
          
          return false;
        });
        
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
