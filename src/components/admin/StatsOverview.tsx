
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
        } catch (bookingError) {
          console.error("Error fetching from bookingService:", bookingError);
        }
        
      } catch (error) {
        console.error("Error fetching bookings count:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchUserCount = async () => {
      // Get user count from props if available
      if (Array.isArray(allUsers)) {
        setUserCount(allUsers.length);
        return;
      }
      
      try {
        // Try API
        try {
          const response = await apiService.getAllUsers();
          if (response.success && Array.isArray(response.data)) {
            setUserCount(response.data.length);
            return;
          }
        } catch (apiError) {
          console.error("Error fetching users from API:", apiError);
        }
        
        // Try userDatabase
        try {
          const users = await userDatabase.getAllUsers();
          setUserCount(Array.isArray(users) ? users.length : 0);
        } catch (dbError) {
          console.error("Error fetching from userDatabase:", dbError);
        }
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };
    
    fetchBookingsCount();
    fetchUserCount();
  }, [allUsers]);
  
  const getMachineCount = (machines: any[]) => {
    if (!Array.isArray(machines)) return;
    
    const filteredMachines = machines.filter(machine => {
      const id = machine.id || machine._id;
      const stringId = String(id);
      return stringId !== '5' && stringId !== '6';
    });
    
    setMachineCount(filteredMachines.length);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Users"
        value={isLoading ? "..." : userCount.toString()}
        icon={<Users className="h-5 w-5 text-blue-600" />}
        description="Total registered users"
        color="bg-blue-100 text-blue-800"
      />
      
      <StatCard 
        title="Machines"
        value={isLoading ? "..." : machineCount.toString()}
        icon={<Settings className="h-5 w-5 text-purple-600" />}
        description="Available in makerspace"
        color="bg-purple-100 text-purple-800"
      />
      
      <StatCard 
        title="Bookings"
        value={isLoading ? "..." : bookingsCount.toString()}
        icon={<CalendarClock className="h-5 w-5 text-emerald-600" />}
        description="Machine appointments"
        color="bg-emerald-100 text-emerald-800"
      />
      
      <StatCard 
        title="Certifications"
        value={isLoading ? "..." : "26"}
        icon={<Users className="h-5 w-5 text-amber-600" />}
        description="User qualifications"
        color="bg-amber-100 text-amber-800"
      />
    </div>
  );
};

export default StatsOverview;
