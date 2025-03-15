
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from './StatCard';
import { machines } from '../../utils/data';
import { User } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import userDatabase from '@/services/userDatabase';
import mongoDbService from '@/services/mongoDbService';

interface StatsOverviewProps {
  allUsers: User[];
  machines: any[];
}

export const StatsOverview = ({ allUsers, machines }: StatsOverviewProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    certifications: 0,
    machinesAvailable: 0,
    machinesInUse: 0,
    machinesMaintenance: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get MongoDB user count
        const mongoUserCount = await mongoDbService.getUserCount();
        
        // Calculate certifications count
        let certCount = 0;
        allUsers.forEach(user => {
          if (user.certifications && Array.isArray(user.certifications)) {
            certCount += user.certifications.length;
          }
        });
        
        // Count machine statuses
        let available = 0;
        let inUse = 0;
        let maintenance = 0;
        
        machines.forEach(machine => {
          const status = machine.status || 'available';
          if (status.toLowerCase() === 'available') available++;
          else if (status.toLowerCase() === 'in-use' || status.toLowerCase() === 'inuse' || status.toLowerCase() === 'in use') inUse++;
          else if (status.toLowerCase() === 'maintenance') maintenance++;
        });
        
        setStats({
          users: mongoUserCount,
          certifications: certCount,
          machinesAvailable: available,
          machinesInUse: inUse,
          machinesMaintenance: maintenance
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
    fetchStats();
  }, [allUsers, machines]);

  const fetchUsers = async () => {
    try {
      // Try to get users from MongoDB/userDatabase
      const users = await userDatabase.getAllUsers();
      console.log(`Retrieved ${users.length} users from userDatabase`);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard
        title="Total Users"
        value={loading ? <Skeleton className="h-8 w-20" /> : stats.users}
        description="Registered users"
        icon="user"
        trend={{ value: "12%", label: "from last month" }}
      />
      
      <StatCard
        title="Certifications"
        value={loading ? <Skeleton className="h-8 w-20" /> : stats.certifications}
        description="Active certifications"
        icon="award"
        trend={{ value: "8%", label: "from last month" }}
      />
      
      <StatCard
        title="Machines Available"
        value={loading ? <Skeleton className="h-8 w-20" /> : stats.machinesAvailable}
        description="Ready for use"
        icon="check-circle"
        trend={{ value: "", label: "" }}
      />
      
      <StatCard
        title="Maintenance"
        value={loading ? <Skeleton className="h-8 w-20" /> : stats.machinesMaintenance}
        description="Machines in maintenance"
        icon="tool"
        trend={{ value: "", label: "" }}
      />
    </div>
  );
};
