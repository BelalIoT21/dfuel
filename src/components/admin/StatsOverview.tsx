import { Users, Settings, CalendarClock } from "lucide-react";
import { StatCard } from "./StatCard";
import { useEffect, useState } from "react";
import { apiService } from "@/services/apiService";

interface StatsOverviewProps {
  allUsers?: any[];
  machines: any[];
}

export const StatsOverview = ({ allUsers = [], machines }: StatsOverviewProps) => {
  const [bookingsCount, setBookingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userCount, setUserCount] = useState(allUsers.length);
  const [machineCount, setMachineCount] = useState(() => {
    if (!Array.isArray(machines)) return 0;
    return machines.filter(machine => {
      const id = machine.id || machine._id;
      const stringId = String(id);
      return stringId !== '5' && stringId !== '6';
    }).length;
  });

  useEffect(() => {
    setUserCount(allUsers.length);
  }, [allUsers]);
  
  useEffect(() => {
    if (Array.isArray(machines)) {
      const count = machines.filter(machine => {
        const id = machine.id || machine._id;
        const stringId = String(id);
        return stringId !== '5' && stringId !== '6';
      }).length;
      setMachineCount(count);
    }
  }, [machines]);
  
  useEffect(() => {
    const fetchBookingsCount = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getAllBookings();
        if (response.success && Array.isArray(response.data)) {
          setBookingsCount(response.data.length);
        }
      } catch (error) {
        console.error("Error fetching bookings count:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingsCount();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total Users"
        value={userCount}
        icon={<Users className="h-4 w-4" />}
        link="/admin/users"
      />
      <StatCard
        title="Active Machines"
        value={machineCount}
        icon={<Settings className="h-4 w-4" />}
        link="/admin/machines"
      />
      <StatCard
        title="Total Bookings"
        value={isLoading ? "..." : bookingsCount}
        icon={<CalendarClock className="h-4 w-4" />}
        link="/admin/bookings"
      />
    </div>
  );
};

export default StatsOverview;
