
import { Users, Settings, CalendarClock, UserCheck, Shield } from "lucide-react";
import { StatCard } from "./StatCard";

interface StatsOverviewProps {
  allUsers: any[];
  machines: any[];
}

export const StatsOverview = ({ allUsers, machines }: StatsOverviewProps) => {
  // Filter out safety cabinet completely from machines
  const actualMachines = machines.filter(machine => machine.id !== 'safety-cabinet');
  
  // Count safety courses completed
  const safetyCourseCount = allUsers.reduce((total, user) => 
    total + (user.safetyCoursesCompleted ? user.safetyCoursesCompleted.length : 0), 0);
  
  // Basic statistics for the admin dashboard - completely excluding safety cabinet
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
      value: actualMachines.length, 
      icon: <Settings className="h-5 w-5 text-purple-600" />,
      change: '0%',
      link: '/admin/machines'
    },
    { 
      title: 'Certifications', 
      value: allUsers.reduce((total, user) => {
        // Filter out safety-cabinet from certifications count
        const machineOnlyCertifications = user.certifications.filter(
          cert => cert !== 'safety-cabinet'
        );
        return total + machineOnlyCertifications.length;
      }, 0), 
      icon: <UserCheck className="h-5 w-5 text-purple-600" />,
      change: '+' + allUsers.reduce((total, user) => {
        const machineOnlyCertifications = user.certifications.filter(
          cert => cert !== 'safety-cabinet'
        );
        return total + machineOnlyCertifications.length;
      }, 0),
      link: '/admin/users'
    },
    { 
      title: 'Safety Courses', 
      value: safetyCourseCount, 
      icon: <Shield className="h-5 w-5 text-green-600" />,
      change: '+' + safetyCourseCount,
      link: '/admin/users'
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
