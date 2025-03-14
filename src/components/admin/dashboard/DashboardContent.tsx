
import { useState, useEffect } from 'react';
import { StatsOverview } from '../StatsOverview';
import { PendingActions } from '../PendingActions';
import { MachineStatus } from '../MachineStatus';
import { QuickActions } from '../QuickActions';
import { PlatformOverview } from '../PlatformOverview';
import { useAuth } from '@/context/AuthContext';
import { machines } from '@/utils/data';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';

export const DashboardContent = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Filter out safety cabinet and safety course
  const actualMachines = machines.filter(
    machine => machine.id !== 'safety-cabinet' && machine.id !== '3' && machine.id !== 'safety-course'
  );
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.isAdmin) {
        setError('You must be an admin to view this page');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get users from local database since API might not be available
        const users = await fetch('/api/users')
          .then(res => res.json())
          .catch(() => []);
        
        setAllUsers(users || []);
      } catch (error) {
        console.error('API request failed:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <StatsOverview allUsers={allUsers} machines={actualMachines} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MachineStatus machines={actualMachines} />
          <PlatformOverview />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <PendingActions />
        </div>
      </div>
    </div>
  );
};
