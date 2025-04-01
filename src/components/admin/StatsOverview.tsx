
import { Users, Settings, CalendarClock } from "lucide-react";
import { StatCard } from "./StatCard";
import { useEffect, useState, useRef } from "react";
import { bookingService } from "@/services/bookingService";
import userDatabase from "@/services/userDatabase";
import { apiService } from "@/services/apiService";
import { isWeb } from "@/utils/platform";
import mongoDbService from "@/services/mongoDbService";

interface StatsOverviewProps {
  allUsers?: any[];
  machines: any[];
}

export const StatsOverview = ({ allUsers = [], machines }: StatsOverviewProps) => {
  const [bookingsCount, setBookingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [machineCount, setMachineCount] = useState(0);
  const isFetchingRef = useRef(false);
  const lastFetchedRef = useRef(0);
  
  // Set machine count when machines prop changes
  useEffect(() => {
    if (Array.isArray(machines)) {
      getMachineCount(machines);
    }
  }, [machines]);
  
  // Fetch the actual bookings count
  useEffect(() => {
    const fetchBookingsCount = async () => {
      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current) return;
      
      // Only fetch if it's been more than 60 seconds since the last fetch
      const now = Date.now();
      if (now - lastFetchedRef.current < 60000 && lastFetchedRef.current > 0) {
        console.log("Stats: Skipping fetch, last fetched less than 60 seconds ago");
        return;
      }
      
      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        lastFetchedRef.current = now;
        
        // First try getting the data directly from MongoDB
        try {
          console.log("StatsOverview: Fetching bookings directly from MongoDB");
          const mongoBookings = await mongoDbService.getAllBookings();
          if (Array.isArray(mongoBookings) && mongoBookings.length > 0) {
            console.log("StatsOverview: Got bookings from MongoDB:", mongoBookings.length);
            setBookingsCount(mongoBookings.length);
            setIsLoading(false);
            return;
          }
        } catch (mongoError) {
          console.error("StatsOverview: Error fetching from MongoDB:", mongoError);
        }
        
        // Try API next for bookings
        try {
          console.log("StatsOverview: Fetching bookings from API");
          const response = await apiService.getAllBookings();
          if (response.success && Array.isArray(response.data)) {
            console.log("StatsOverview: Fetched bookings from API:", response.data.length);
            setBookingsCount(response.data.length);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.error("StatsOverview: Error fetching bookings from API:", apiError);
        }
        
        // Last resort - try bookingService
        try {
          console.log("StatsOverview: Falling back to bookingService");
          const bookings = await bookingService.getAllBookings();
          console.log("StatsOverview: Fetched bookings:", bookings);
          setBookingsCount(Array.isArray(bookings) ? bookings.length : 0);
        } catch (error) {
          console.error("StatsOverview: Error fetching bookings count:", error);
          setBookingsCount(0);
        }
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };
    
    fetchBookingsCount();
    
    // Only update stats every 2 minutes at most
    const intervalId = setInterval(fetchBookingsCount, 120000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Ensure user count is fetched consistently from API first, then fallback to props or userDatabase
  useEffect(() => {
    const fetchUsers = async () => {
      // Only fetch if it's been more than 60 seconds since the last fetch
      const now = Date.now();
      if (now - lastFetchedRef.current < 60000 && lastFetchedRef.current > 0) {
        console.log("Stats: Skipping user fetch, last fetched less than 60 seconds ago");
        return;
      }
      
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
  
  // Get actual machine count based on the machines array
  const getMachineCount = (machinesArray: any[]) => {
    if (!Array.isArray(machinesArray)) {
      console.log("Machines is not an array:", machinesArray);
      setMachineCount(0);
      return 0;
    }
    
    console.log("Total machines before filtering:", machinesArray.length);
    
    // Filter out ONLY machines with IDs 5 and 6 (safety cabinet and safety course)
    const filteredMachines = machinesArray.filter(machine => {
      const id = machine.id || machine._id;
      const stringId = String(id); // Convert to string to ensure consistent comparison
      return stringId !== '5' && stringId !== '6';
    });
    
    console.log("Filtered machines count:", filteredMachines.length);
    
    // Update state with the count
    setMachineCount(filteredMachines.length);
    
    // Return the actual count from the filtered array
    return filteredMachines.length;
  };
  
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
      value: machineCount, 
      icon: <Settings className="h-5 w-5 text-purple-600" />,
      change: '',
      link: '/admin/machines'
    },
    { 
      title: 'Active Bookings', 
      value: isLoading ? '...' : bookingsCount, 
      icon: <CalendarClock className="h-5 w-5 text-purple-600" />,
      change: '',
      link: '/bookings'  // Changed from '/admin/bookings' to '/bookings'
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
