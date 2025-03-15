
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
  
  // Calculate total certifications, including safety course certificates
  const totalCertifications = 6; // Fixed at 6 as requested
  
  // Basic statistics for the admin dashboard
  const stats = [
    { 
      title: 'Total Users', 
      value: 2, // Fixed at 2 as requested
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
      value: allUsers.reduce((total, user) => total + (user.bookings ? user.bookings.length : 0), 0), 
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
