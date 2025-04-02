
import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { isWeb } from '@/utils/platform';

export const StatsOverview = () => {
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookingsCount = async () => {
      try {
        setIsLoading(true);
        
        // Only make API calls in a web environment to avoid MongoDB errors
        if (isWeb()) {
          const response = await apiService.getAllBookings();
          
          if (response.error) {
            console.error('Error fetching bookings:', response.error);
            toast({
              title: "Error fetching bookings",
              description: "Could not load booking statistics",
              variant: "destructive"
            });
            return;
          }
          
          const bookings = Array.isArray(response.data) ? response.data : [];
          setBookingsCount(bookings.length);
        } else {
          // For non-web environments, set a default value
          setBookingsCount(0);
        }
      } catch (error) {
        console.error('Error fetching bookings count:', error);
        toast({
          title: "Error fetching bookings",
          description: "Could not load booking statistics",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }; 

    fetchBookingsCount();
  }, [toast]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
        <p className="text-2xl font-bold mt-1">
          {isLoading ? "Loading..." : bookingsCount}
        </p>
      </div>
      {/* Add more stat cards as needed */}
    </div>
  );
};

export default StatsOverview;
