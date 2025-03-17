
import { Users, Settings, CalendarClock } from "lucide-react";
import { StatCard } from "./StatCard";
import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import userDatabase from "@/services/userDatabase";
import { apiService } from "@/services/apiService";
import { isWeb } from "@/utils/platform";

interface StatsOverviewProps {
  allUsers?: any[];
  machines: any[];
}

export const StatsOverview = ({ allUsers = [], machines }: StatsOverviewProps) => {
  const [bookingsCount, setBookingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  
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
  
  // Ensure user count is fetched consistently from API first, then fallback to props or userDatabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Fetching users for stats overview");
        
        // Always try the API first for consistency between web and native
        const response = await apiService.getAllUsers();
        if (response.success && response.data && response.data.length > 0) {
          console.log(`Retrieved ${response.data.length} users from API`);
          setUserCount(response.data.length);
          return;
        }
        
        // If API fails but allUsers prop is provided, use it
        if (allUsers && allUsers.length > 0) {
          console.log(`Using provided users list: ${allUsers.length} users`);
          setUserCount(allUsers.length);
          return;
        }
        
        // Last resort - fetch directly from database
        console.log("Falling back to userDatabase for user count");
        const users = await userDatabase.getAllUsers();
        console.log(`Retrieved ${users.length} users from userDatabase`);
        setUserCount(users.length);
      } catch (error) {
        console.error("Error fetching users for stats:", error);
        // If all else fails, use the provided users or show 0
        setUserCount(allUsers?.length || 0);
      }
    };
    
    fetchUsers();
  }, [allUsers]);
  
  // Filter out machines 5 and 6
  const filteredMachines = machines.filter(machine => {
    const machineId = machine.id || machine._id;
    return machineId !== '5' && machineId !== '6' && 
           machineId !== 5 && machineId !== 6; // Handle both string and number IDs
  });
  
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
      value: filteredMachines.length, 
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
