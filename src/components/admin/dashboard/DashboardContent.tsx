import { PlatformOverview } from "@/components/admin/PlatformOverview";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { RecentActivities } from "@/components/admin/RecentActivities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { checkMongoDBConnection, getMongoDBConnectionDetails } from '@/services/mongodb/connectionService';

export const DashboardContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [mongoDBConnected, setMongoDBConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkMongoDBConnection();
      setMongoDBConnected(isConnected);
      
      if (!isConnected) {
        console.error("MongoDB connection issue detected. Connection details:", getMongoDBConnectionDetails());
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/home');
    }

    const fetchDashboardData = async () => {
      try {
        const usersResponse = await apiService.getAllUsers();
        if (usersResponse.data && Array.isArray(usersResponse.data)) {
          setAllUsers(usersResponse.data);
        } else {
          console.warn("Users data is not an array:", usersResponse.data);
          setAllUsers([]);
        }

        const machinesResponse = await apiService.getAllMachines();
        if (machinesResponse.data && Array.isArray(machinesResponse.data)) {
          setMachines(machinesResponse.data);
        } else {
          console.warn("Machines data is not an array:", machinesResponse.data);
          setMachines([]);
        }

        const bookingsResponse = await apiService.getAllBookings();
        if (bookingsResponse.data && Array.isArray(bookingsResponse.data)) {
          setBookings(bookingsResponse.data);
        } else {
          console.warn("Bookings data is not an array:", bookingsResponse.data);
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  return (
    <div>
      {mongoDBConnected === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">MongoDB Connection Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>There appears to be an issue connecting to the MongoDB database. This may affect data loading. Please check server logs for more details.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsOverview allUsers={allUsers} machines={machines} bookings={bookings} />
        <PlatformOverview allUsers={allUsers} />
        <RecentActivities bookings={bookings} />
        <Card className="hidden lg:block border-purple-100">
          <CardHeader>
            <CardTitle>More to come...</CardTitle>
            <CardDescription>We're always adding new features to the admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Stay tuned for more updates!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
