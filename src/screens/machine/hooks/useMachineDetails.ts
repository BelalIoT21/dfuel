
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
  const [userCertifications, setUserCertifications] = useState([]);

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
        
        // Admin users are always considered certified
        if (user.isAdmin) {
          console.log("Admin user is always certified");
          setIsCertified(true);
          setHasMachineSafetyCert(true);
          setUserCertifications([machineId, SAFETY_COURSE_ID]); // Set admin certifications
          setLoading(false);
          return;
        }
        
        // Try different approaches to get the user's certifications
        let foundCertifications = [];
        let success = false;
        
        // Approach 1: Try using certificationDatabaseService through certificationService
        try {
          console.log("Attempting to fetch certifications via certificationService");
          const certifications = await certificationService.getUserCertifications(user.id);
          console.log("Got certifications from service:", certifications);
          if (Array.isArray(certifications) && certifications.length > 0) {
            foundCertifications = certifications.map(cert => cert.toString());
            success = true;
          }
        } catch (error) {
          console.error("Failed to get certifications via service:", error);
        }
        
        // Approach 2: If first approach failed, try direct fetch
        if (!success) {
          try {
            console.log("Attempting direct fetch for certifications");
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            const response = await fetch(`${apiUrl}/api/certifications/user/${user.id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const certifications = await response.json();
              console.log("Certifications from direct fetch:", certifications);
              if (Array.isArray(certifications)) {
                foundCertifications = certifications.map(cert => cert.toString());
                success = true;
              }
            } else {
              console.log("Direct fetch response not OK:", response.status);
            }
          } catch (fetchError) {
            console.error("Direct fetch failed:", fetchError);
          }
        }
        
        // Approach 3: Fall back to user.certifications if available
        if (!success && user && user.certifications) {
          console.log("Using certifications from user object:", user.certifications);
          if (Array.isArray(user.certifications)) {
            foundCertifications = user.certifications.map(cert => 
              typeof cert === 'object' ? (cert.id || cert._id || '').toString() : cert.toString()
            );
            success = true;
          }
        }
        
        // Approach 4: If all else fails, try to find certifications in localStorage
        if (!success) {
          try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (storedUser && storedUser.certifications) {
              console.log("Using certifications from localStorage:", storedUser.certifications);
              foundCertifications = storedUser.certifications.map(cert => cert.toString());
              success = true;
            }
          } catch (e) {
            console.error("Failed to parse localStorage user:", e);
          }
        }
        
        console.log("Final certifications array:", foundCertifications);
        setUserCertifications(foundCertifications);
        
        // Check if user is certified for this machine
        const isUserCertified = foundCertifications.includes(machineId);
        console.log(`Is user certified for machine ${machineId}:`, isUserCertified);
        setIsCertified(isUserCertified);
        
        // Check if user has safety certification
        const hasSafetyCert = foundCertifications.includes(SAFETY_COURSE_ID);
        console.log("User has safety certification:", hasSafetyCert);
        setHasMachineSafetyCert(hasSafetyCert);
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
    userId: user?.id,
    userCertifications
  };
};
