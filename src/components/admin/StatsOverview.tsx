
import { Users, Settings, CalendarClock, UserCheck, ShieldCheck } from "lucide-react";
import { StatCard } from "./StatCard";

interface StatsOverviewProps {
  allUsers: any[];
  machines: any[];
}

export const StatsOverview = ({ allUsers, machines }: StatsOverviewProps) => {
  // Filter out safety cabinet from machines count - only count real machines
  const realMachines = machines.filter(machine => machine.type !== 'Safety Cabinet');
  
  // Filter only safety cabinet equipment
  const safetyEquipment = machines.filter(machine => machine.type === 'Safety Cabinet');
  
  // Update machine types
  realMachines.forEach(machine => {
    machine.type = 'Machine';
  });
  
  // Update safety cabinet type
  safetyEquipment.forEach(equipment => {
    equipment.type = 'Equipment';
  });
  
  // Basic statistics for the admin dashboard
  const stats = [
    { 
      title: 'Total Users', 
      value: allUsers.length, 
      icon: <Users className="h-5 w-5 text-purple-600" />,
      change: allUsers.length > 0 ? '+' + allUsers.length : '0',
      link: '/admin/users'
    },
    { 
      title: 'Total Machines', 
      value: realMachines.length, 
      icon: <Settings className="h-5 w-5 text-purple-600" />,
      change: '',  // Removed the 0% here
      link: '/admin/machines'
    },
    { 
      title: 'Certifications', 
      value: allUsers.reduce((total, user) => total + user.certifications.length, 0), 
      icon: <UserCheck className="h-5 w-5 text-purple-600" />,
      change: '0',  // Just 0 without +
      link: '/admin/users'
    },
    { 
      title: 'Active Bookings', 
      value: allUsers.reduce((total, user) => total + (user.bookings ? user.bookings.length : 0), 0), 
      icon: <CalendarClock className="h-5 w-5 text-purple-600" />,
      change: allUsers.reduce((total, user) => total + (user.bookings ? user.bookings.length : 0), 0) > 0 ? 
        '+' + allUsers.reduce((total, user) => total + (user.bookings ? user.bookings.length : 0), 0) : '0',
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
