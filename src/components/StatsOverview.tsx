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
        
        // Only make API calls in a web environment
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
};

export default StatsOverview;
