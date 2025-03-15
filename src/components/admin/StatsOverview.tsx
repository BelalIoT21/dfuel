
import { Users, Settings, CalendarClock, UserCheck } from "lucide-react";
import { StatCard } from "./StatCard";
import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { certificationService } from "@/services/certificationService";

interface StatsOverviewProps {
  allUsers: any[];
  machines: any[];
}

export const StatsOverview = ({ allUsers, machines }: StatsOverviewProps) => {
  const [bookingsCount, setBookingsCount] = useState(0);
  const [totalCertifications, setTotalCertifications] = useState(0);
  
  // Fetch the actual bookings count
  useEffect(() => {
    const fetchBookingsCount = async () => {
      try {
        const bookings = await bookingService.getAllBookings();
        setBookingsCount(bookings.length);
      } catch (error) {
        console.error("Error fetching bookings count:", error);
      }
    };
    
    fetchBookingsCount();
  }, []);
  
  // Calculate total certifications across all users (excluding safety certs)
  useEffect(() => {
    const calculateCertifications = () => {
      let count = 0;
      
      // For each user, count their machine certifications (excluding safety cabinet and safety course)
      allUsers.forEach(user => {
        if (user.certifications) {
          // Filter out safety cabinet (id: "5") and safety course (id: "6")
          const machineCerts = user.certifications.filter(certId => 
            certId !== "5" && certId !== "6"
          );
          count += machineCerts.length;
        }
      });
      
      setTotalCertifications(count);
    };
    
    calculateCertifications();
  }, [allUsers]);
  
  // Filter out equipment (including Safety Cabinet) - only count real machines
  const realMachines = machines.filter(machine => machine.type !== 'Equipment' && machine.type !== 'Safety Cabinet');
  
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
      value: bookingsCount, 
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
