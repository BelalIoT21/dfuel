
import { Users, Settings, CalendarClock } from "lucide-react";
import { StatCard } from "./StatCard";
import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";

interface StatsOverviewProps {
  allUsers: any[];
  machines: any[];
}

export const StatsOverview = ({ allUsers, machines }: StatsOverviewProps) => {
  const [bookingsCount, setBookingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch the actual bookings count
  useEffect(() => {
    const fetchBookingsCount = async () => {
      try {
        setIsLoading(true);
        // Try fetching all bookings including pending ones
        const bookings = await bookingService.getAllBookings();
        console.log("Fetched bookings:", bookings);
        setBookingsCount(bookings.length);
      } catch (error) {
        console.error("Error fetching bookings count:", error);
        setBookingsCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingsCount();
  }, []);
  
  // Filter out equipment - only count real machines (including Bambu Lab X1 E)
  const realMachines = machines.filter(machine => machine.type !== 'Equipment');
  
  // Get the actual user count
  const userCount = allUsers ? allUsers.length : 0;
  
  // Basic statistics for the admin dashboard
  const stats = [
    { 
      title: `Total Users`, 
      value: userCount, 
      icon: <Users className="h-5 w-5 text-purple-600" />,
      change: '', 
      link: '/admin/users'
    },
    { 
      title: 'Total Machines', 
      value: realMachines.length, 
      icon: <Settings className="h-5 w-5 text-purple-600" />,
      change: '',
      link: '/admin/machines'
    },
    { 
      title: 'Active Bookings', 
      value: isLoading ? '...' : bookingsCount, 
      icon: <CalendarClock className="h-5 w-5 text-purple-600" />,
      change: '',
      link: '/admin/bookings'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
