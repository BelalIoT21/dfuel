import { useState, useEffect, useCallback } from 'react';
import { PendingBookingsCard } from "./PendingBookingsCard";
import { bookingService } from '@/services/bookingService';
import { Loader2, RefreshCw } from 'lucide-react';
import mongoDbService from '@/services/mongoDbService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { isWeb } from '@/utils/platform';

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const fetchPendingBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (isWeb()) {
        try {
          const response = await apiService.request('bookings/all', 'GET');
          if (response?.data && Array.isArray(response.data)) {
            const pendingOnly = response.data.filter(booking => 
              booking.status === 'Pending' || booking.status === 'pending'
            );
            setPendingBookings(pendingOnly);
            setIsLoading(false);
            setIsRefreshing(false);
            return;
          }
        } catch (apiError) {
          console.error("API booking fetch error:", apiError);
        }
      }
      
      let allBookings = [];
      try {
        allBookings = await mongoDbService.getAllBookings();
      } catch (mongoError) {
        console.error("MongoDB booking fetch error:", mongoError);
      }
      
      if (!allBookings || allBookings.length === 0) {
        allBookings = await bookingService.getAllBookings();
      }
      
      const pendingOnly = Array.isArray(allBookings) ? allBookings.filter(booking => 
        booking.status === 'Pending' || booking.status === 'pending'
      ) : [];
      
      setPendingBookings(pendingOnly);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setPendingBookings([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPendingBookings();
    
    const intervalId = setInterval(() => {
      fetchPendingBookings();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [fetchPendingBookings]);

  const handleBookingStatusChange = useCallback(async () => {
    await fetchPendingBookings();
  }, [fetchPendingBookings]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchPendingBookings();
    toast({
      title: "Refreshing Bookings",
      description: "Fetching the latest booking information..."
    });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pending Actions</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-4 bg-white rounded-lg shadow flex flex-col items-center">
            <Loader2 className="h-6 w-6 text-purple-600 animate-spin mb-2" />
            <p>Loading pending bookings...</p>
          </div>
        ) : pendingBookings.length > 0 ? (
          <PendingBookingsCard 
            pendingBookings={pendingBookings}
            onBookingStatusChange={handleBookingStatusChange}
          />
        ) : (
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <p className="text-gray-500">No pending bookings to approve</p>
          </div>
        )}
      </div>
    </div>
  );
};
