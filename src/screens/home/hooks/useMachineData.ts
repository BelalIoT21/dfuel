
import { useState, useEffect, useCallback } from 'react';
import { machines } from '../../../utils/data';
import userDatabase from '../../../services/userDatabase';

export const useMachineData = (user, navigation) => {
  const [machineData, setMachineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMachineData = async () => {
    try {
      setLoading(true);
      const extendedMachines = await Promise.all(machines.map(async (machine) => {
        try {
          const status = await userDatabase.getMachineStatus(machine.id);
          return {
            ...machine,
            status: status || 'available'
          };
        } catch (error) {
          console.error(`Error loading status for machine ${machine.id}:`, error);
          return {
            ...machine,
            status: 'available'
          };
        }
      }));
      setMachineData(extendedMachines);
    } catch (error) {
      console.error("Error loading machine data:", error);
      setMachineData(machines.map(machine => ({
        ...machine,
        status: 'available'
      })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      navigation.replace('AdminDashboard');
      return;
    }
    
    if (user) {
      loadMachineData();
    }
  }, [user, navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMachineData();
  }, []);

  return {
    machineData,
    loading,
    refreshing,
    onRefresh,
    loadMachineData
  };
};
