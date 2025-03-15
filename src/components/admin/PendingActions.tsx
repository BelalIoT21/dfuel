
import { useState, useEffect, useCallback } from 'react';
import { PendingBookingsCard } from "./PendingBookingsCard";
import { bookingService } from '@/services/bookingService';
import { Loader2 } from 'lucide-react';
import mongoDbService from '@/services/mongoDbService';

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchPendingBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try MongoDB first for direct database access
      let allBookings = [];
      try {
        console.log("Fetching bookings directly from MongoDB");
        allBookings = await mongoDbService.getAllBookings();
        console.log(`Found ${allBookings.length} bookings in MongoDB`);
      } catch (mongoError) {
        console.error("MongoDB booking fetch error:", mongoError);
      }
      
      // If MongoDB fails or returns empty, use the service
      if (!allBookings || allBookings.length === 0) {
        console.log("Falling back to bookingService");
        allBookings = await bookingService.getAllBookings();
        console.log(`Found ${allBookings.length} total bookings via bookingService`);
      }
      
      const pendingOnly = allBookings.filter(booking => booking.status === 'Pending');
      console.log(`Found ${pendingOnly.length} pending bookings`);
      
      setPendingBookings(pendingOnly);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setPendingBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPendingBookings();
    
    // Set up polling to refresh pending bookings every 10 seconds
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing pending bookings");
      fetchPendingBookings();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [fetchPendingBookings]);

  // Handle booking status change to completely refresh the list
  const handleBookingStatusChange = useCallback(async () => {
    console.log("Booking status changed, refreshing list");
    // Force immediate refresh of the bookings list
    await fetchPendingBookings();
  }, [fetchPendingBookings]);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Actions</h2>
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
