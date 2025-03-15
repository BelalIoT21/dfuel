
import { useState, useEffect, useCallback } from 'react';
import { PendingBookingsCard } from "./PendingBookingsCard";
import { bookingService } from '@/services/bookingService';
import { Loader2, RefreshCw } from 'lucide-react';
import mongoDbService from '@/services/mongoDbService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { isWeb } from '@/utils/platform';

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();
  
  const fetchPendingBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(false);
      
      let allBookings = [];
      
      // In web environment, MongoDB might not be accessible
      if (!isWeb) {
        try {
          console.log("Fetching bookings directly from MongoDB");
          allBookings = await mongoDbService.getAllBookings();
          console.log(`Found ${allBookings.length} bookings in MongoDB`);
        } catch (mongoError) {
          console.error("MongoDB booking fetch error:", mongoError);
        }
      }
      
      // If MongoDB fails or returns empty, use the service
      if (!allBookings || allBookings.length === 0) {
        console.log("Falling back to bookingService");
        try {
          allBookings = await bookingService.getAllBookings();
          console.log(`Found ${allBookings.length} total bookings via bookingService`);
        } catch (serviceError) {
          console.error("BookingService error:", serviceError);
          setError(true);
          allBookings = [];
        }
      }
      
      const pendingOnly = allBookings.filter(booking => booking.status === 'Pending');
      console.log(`Found ${pendingOnly.length} pending bookings`);
      
      setPendingBookings(pendingOnly);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setPendingBookings([]);
      setError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPendingBookings();
    
    // Set up polling to refresh pending bookings every 30 seconds (reduced from 10 seconds)
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing pending bookings");
      fetchPendingBookings();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchPendingBookings]);

  // Handle booking status change to completely refresh the list
  const handleBookingStatusChange = useCallback(async () => {
    console.log("Booking status changed, refreshing list");
    // Force immediate refresh of the bookings list
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
        ) : error ? (
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <p className="text-red-500 mb-2">Error loading bookings</p>
            <Button variant="outline" size="sm" onClick={handleManualRefresh}>Try Again</Button>
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
