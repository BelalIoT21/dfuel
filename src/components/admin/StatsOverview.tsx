
import { Users, Settings, CalendarClock } from "lucide-react";
import { StatCard } from "./StatCard";
import { useEffect, useState, useRef } from "react";
import { apiService } from "@/services/apiService";

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
  const bookingsTimestampRef = useRef(0);
  
  // Set machine count when machines prop changes
  useEffect(() => {
    if (Array.isArray(machines)) {
      getMachineCount(machines);
    }
  }, [machines]);
  
  // Fetch the actual bookings count with reduced frequency
  useEffect(() => {
    const fetchBookingsCount = async () => {
      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current) return;
      
      // Only fetch if it's been more than 180 seconds since the last fetch
      const now = Date.now();
      if (now - bookingsTimestampRef.current < 180000 && bookingsTimestampRef.current > 0) {
        console.log("Stats: Skipping bookings fetch, last fetched less than 180 seconds ago");
        return;
      }
      
      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        bookingsTimestampRef.current = now;
        
        // Try API for bookings
        try {
          console.log("StatsOverview: Fetching bookings from API");
          const response = await apiService.request({
            method: 'GET',
            url: 'bookings/all'
          });
          
          if (response?.data && Array.isArray(response.data)) {
            console.log("StatsOverview: Fetched bookings from API:", response.data.length);
            setBookingsCount(response.data.length);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.error("StatsOverview: Error fetching bookings from API:", apiError);
        }
        
        // If we get here, there was an error or no bookings
        setBookingsCount(0);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };
    
    fetchBookingsCount();
    
    // Only update stats every 3 minutes at most
    const intervalId = setInterval(fetchBookingsCount, 180000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Ensure user count is fetched consistently from props first, then fallback to API
  useEffect(() => {
    const fetchUsers = async () => {
      // Only fetch if it's been more than 180 seconds since the last fetch
      const now = Date.now();
      if (now - lastFetchedRef.current < 180000 && lastFetchedRef.current > 0) {
        console.log("Stats: Skipping user fetch, last fetched less than 180 seconds ago");
        return;
      }
      
      try {
        lastFetchedRef.current = now;
        console.log("Fetching users for stats overview");
        
        // If allUsers prop is provided, use it (most efficient)
        if (allUsers && allUsers.length > 0) {
          console.log(`Using provided users list: ${allUsers.length} users`);
          setUserCount(allUsers.length);
          return;
        }
        
        // Try the API as fallback, but avoid making this call unless necessary
        if (userCount === 0) {
          const response = await apiService.getAllUsers();
          if (response.data && response.data.length > 0) {
            console.log(`Retrieved ${response.data.length} users from API`);
            setUserCount(response.data.length);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching users for stats:", error);
      }
    };
    
    fetchUsers();
    
    // Don't set up an interval for this - we'll rely on prop updates
  }, [allUsers, userCount]);
  
  // Get actual machine count based on the machines array
  const getMachineCount = (machinesArray: any[]) => {
    if (!Array.isArray(machinesArray)) {
      console.log("Machines is not an array:", machinesArray);
      setMachineCount(0);
      return 0;
    }
    
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
      link: '/bookings'
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
