import { Users, Settings, CalendarClock } from "lucide-react";
import { StatCard } from "./StatCard";
import { useEffect, useState } from "react";
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
  const [machineCount, setMachineCount] = useState(() => {
    if (!Array.isArray(machines)) return 0;
    return machines.filter(machine => {
      const id = machine.id || machine._id;
      const stringId = String(id);
      return stringId !== '5' && stringId !== '6';
    }).length;
  });
  
  useEffect(() => {
    if (Array.isArray(machines)) {
      getMachineCount(machines);
    }
  }, [machines]);
  
  useEffect(() => {
    const fetchBookingsCount = async () => {
      try {
        setIsLoading(true);
        
        // Try MongoDB first
        try {
          const mongoBookings = await mongoDbService.getAllBookings();
          if (Array.isArray(mongoBookings) && mongoBookings.length > 0) {
            setBookingsCount(mongoBookings.length);
            setIsLoading(false);
            return;
          }
        } catch (mongoError) {
          console.error("Error fetching from MongoDB:", mongoError);
        }
        
        // Try API next
        try {
          const response = await apiService.getAllBookings();
          if (response.success && Array.isArray(response.data)) {
            setBookingsCount(response.data.length);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.error("Error fetching bookings from API:", apiError);
        }
        
        // Last resort - bookingService
        try {
          const bookings = await bookingService.getAllBookings();
          setBookingsCount(Array.isArray(bookings) ? bookings.length : 0);
        } catch (error) {
          console.error("Error fetching bookings count:", error);
          setBookingsCount(0);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingsCount();
  }, []);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Try API first
        const response = await apiService.getAllUsers();
        if (response.success && response.data && response.data.length > 0) {
          setUserCount(response.data.length);
          return;
        }
        
        // Use provided users if available
        if (allUsers && allUsers.length > 0) {
          setUserCount(allUsers.length);
          return;
        }
        
        // Last resort - userDatabase
        const users = await userDatabase.getAllUsers();
        setUserCount(users.length);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUserCount(allUsers?.length || 0);
      }
    };
    
    fetchUsers();
  }, [allUsers]);
  
  const getMachineCount = (machinesArray: any[]) => {
    if (!Array.isArray(machinesArray)) {
      setMachineCount(0);
      return 0;
    }
    
    const filteredMachines = machinesArray.filter(machine => {
      const id = machine.id || machine._id;
      const stringId = String(id);
      return stringId !== '5' && stringId !== '6';
    });
    
    setMachineCount(filteredMachines.length);
    return filteredMachines.length;
  };
  
  const stats = [
    { 
      id: 'users',
      title: `Total Users`, 
      value: userCount, 
      icon: <Users className="h-5 w-5 text-purple-600" />,
      change: '', 
      link: '/admin/users'
    },
    { 
      id: 'machines',
      title: 'Total Machines', 
      value: machineCount, 
      icon: <Settings className="h-5 w-5 text-purple-600" />,
      change: '',
      link: '/admin/machines'
    },
    { 
      id: 'bookings',
      title: 'Active Bookings', 
      value: isLoading ? '...' : bookingsCount, 
      icon: <CalendarClock className="h-5 w-5 text-purple-600" />,
      change: '',
      link: '/bookings'
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 mb-6">
      {stats.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  );
};
