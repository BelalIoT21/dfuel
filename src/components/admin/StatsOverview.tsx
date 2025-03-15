
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
        // Try fetching all bookings including pending ones
        const bookings = await bookingService.getAllBookings();
        console.log("Fetched bookings:", bookings);
        setBookingsCount(bookings.length);
      } catch (error) {
        console.error("Error fetching bookings count:", error);
        setBookingsCount(0);
      }
    };
    
    fetchBookingsCount();
  }, []);
  
  // Calculate total certifications across all users (excluding safety course)
  useEffect(() => {
    const calculateCertifications = () => {
      let count = 0;
      
      // For each user, count their machine certifications (excluding machine safety course)
      allUsers.forEach(user => {
        if (user.certifications) {
          // Filter out Machine Safety Course (ID: "6")
          const machineCerts = user.certifications.filter(certId => 
            certId !== "6"
          );
          count += machineCerts.length;
        }
      });
      
      setTotalCertifications(count);
    };
    
    calculateCertifications();
  }, [allUsers]);
  
  // Filter out equipment - only count real machines (including Bambu Lab X1 E)
  const realMachines = machines.filter(machine => machine.type !== 'Equipment');
  
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
      title: 'Machine Certifications', 
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
