
import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../../src/services/apiService';
import { machines } from '../../../../../src/utils/data';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import { StatsOverview } from '../../../components/admin/StatsOverview';
import { PlatformOverview } from '../../../components/admin/PlatformOverview';
import { QuickActions } from '../../../components/admin/QuickActions';
import { PendingActions } from '../../../components/admin/PendingActions';
import { MachineStatus } from '../../../components/admin/MachineStatus';

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
        
        // Get machine statuses
        const machinesWithStatus = await Promise.all(machines.map(async (machine) => {
          const statusResponse = await apiService.getMachineStatus(machine.id);
          return {
            ...machine,
            status: statusResponse.data || 'available'
          };
        }));
        setMachineData(machinesWithStatus);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto page-transition">
      <AdminHeader pageTitle="Dashboard" />
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
