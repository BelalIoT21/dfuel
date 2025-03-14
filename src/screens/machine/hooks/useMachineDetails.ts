
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { machines } from '../../../utils/data';
import userDatabase from '../../../services/userDatabase';
import { machineApi } from '../../../services/api';

export const useMachineDetails = (machineId, user, navigation) => {
  const [machine, setMachine] = useState(null);
  const [machineStatus, setMachineStatus] = useState('available');
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(false);

  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
      return;
    }

    const loadMachineDetails = async () => {
      try {
        setLoading(true);
        const machineData = machines.find(m => m.id === machineId);
        
        if (!machineData) {
          Alert.alert('Error', 'Machine not found');
          navigation.goBack();
          return;
        }
        
        // Try to get machine status from API
        try {
          const statusResponse = await machineApi.getMachineStatus(machineId);
          if (statusResponse.data) {
            setMachineStatus(statusResponse.data.status || 'available');
          } else {
            // Fallback to local database
            const status = await userDatabase.getMachineStatus(machineId);
            setMachineStatus(status || 'available');
          }
        } catch (error) {
          console.error('Error fetching machine status:', error);
          // Default to available if there's an error
          setMachineStatus('available');
        }
        
        setMachine(machineData);
        
        // Check if user is certified for this machine
        if (user.certifications && user.certifications.includes(machineId)) {
          setIsCertified(true);
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
    setIsCertified
  };
};
