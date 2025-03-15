
import { Users, Settings, CalendarClock, UserCheck, ShieldCheck } from "lucide-react";
import { StatCard } from "./StatCard";

interface StatsOverviewProps {
  allUsers: any[];
  machines: any[];
}

export const StatsOverview = ({ allUsers, machines }: StatsOverviewProps) => {
  // Filter out equipment (including Safety Cabinet) - only count real machines
  const realMachines = machines.filter(machine => machine.type !== 'Equipment' && machine.type !== 'Safety Cabinet');
  
  // Filter only equipment
  const equipment = machines.filter(machine => machine.type === 'Equipment' || machine.type === 'Safety Cabinet');
  
  // Update machine types
  realMachines.forEach(machine => {
    machine.type = 'Machine';
  });
  
  // Calculate total certifications, including Safety Course certifications
  const totalCertifications = allUsers.reduce((total, user) => {
    // Count regular machine certifications
    const machineCertCount = user.certifications ? user.certifications.length : 0;
    
    // Add 1 for Safety Course certification if user has any certifications
    // (assuming if they have any certification, they've completed safety course)
    const hasSafetyCert = machineCertCount > 0 ? 1 : 0;
    
    return total + machineCertCount + hasSafetyCert;
  }, 0);
  
  // Basic statistics for the admin dashboard
  const stats = [
    { 
      title: 'Total Users', 
      value: allUsers.length, 
      icon: <Users className="h-5 w-5 text-purple-600" />,
      change: '', // Removed change indicator
      link: '/admin/users'
    },
    { 
      title: 'Total Machines', 
      value: realMachines.length, 
      icon: <Settings className="h-5 w-5 text-purple-600" />,
      change: '',  // No change indicator
      link: '/admin/machines'
    },
    { 
      title: 'Certifications', 
      value: totalCertifications, 
      icon: <UserCheck className="h-5 w-5 text-purple-600" />,
      change: '',  // Removed change indicator
      link: '/admin/users'
    },
    { 
      title: 'Active Bookings', 
      value: allUsers.reduce((total, user) => total + (user.bookings ? user.bookings.filter(b => b.status === 'Approved').length : 0), 0), 
      icon: <CalendarClock className="h-5 w-5 text-purple-600" />,
      change: '', // Removed change indicator
      link: '/admin/bookings'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
