
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiService } from '../../../services/apiService';
import { machines } from '../../../utils/data';
import { AdminHeader } from '../AdminHeader';
import { StatsOverview } from '../StatsOverview';
import { PlatformOverview } from '../PlatformOverview';
import { QuickActions } from '../QuickActions';
import { PendingActions } from '../PendingActions';
import { MachineStatus } from '../MachineStatus';

export const DashboardContent = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [machineData, setMachineData] = useState<any[]>([]);
  
  useEffect(() => {
    // Load users and machine data
    const fetchData = async () => {
      try {
        // Get all users using our API service
        const response = await apiService.getAllUsers();
        if (response.data) {
          setAllUsers(response.data);
        }
        
        // First get regular machines
        const regularMachines = machines.filter(
          machine => machine.id !== 'safety-cabinet'
        );
        
        // Get safety items
        const safetyItems = machines.filter(
          machine => machine.id === 'safety-cabinet'
        ).map(machine => ({
          ...machine,
          status: 'available' // Always available
        }));
        
        // Get machine statuses
        const machinesWithStatus = await Promise.all(regularMachines.map(async (machine) => {
          try {
            const statusResponse = await apiService.getMachineStatus(machine.id);
            return {
              ...machine,
              status: statusResponse.data?.status || 'available',
              maintenanceNote: statusResponse.data?.note || ''
            };
          } catch (error) {
            console.error(`Error loading status for machine ${machine.id}:`, error);
            return {
              ...machine,
              status: 'available'
            };
          }
        }));
        
        // Combine regular machines and safety items
        setMachineData([...machinesWithStatus, ...safetyItems]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto page-transition">
      <AdminHeader />
      <StatsOverview allUsers={allUsers} machines={machines} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <PlatformOverview allUsers={allUsers} />
        <QuickActions />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <PendingActions />
        <MachineStatus machineData={machineData} setMachineData={setMachineData} />
      </div>
    </div>
  );
};
