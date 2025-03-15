
import { useState, useEffect, useCallback } from 'react';
import { PendingBookingsCard } from "./PendingBookingsCard";
import { bookingService } from '@/services/bookingService';
import { Loader2 } from 'lucide-react';

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchPendingBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      // Get all bookings and filter for pending ones
      const allBookings = await bookingService.getAllBookings();
      console.log(`Found ${allBookings.length} total bookings`);
      
      const pendingBookings = allBookings.filter(booking => booking.status === 'Pending');
      console.log(`Found ${pendingBookings.length} pending bookings`);
      
      setPendingBookings(pendingBookings);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setPendingBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPendingBookings();
  }, [fetchPendingBookings]);

  // Handle booking status change to refresh the list
  const handleBookingStatusChange = () => {
    // Add a slight delay to make sure the booking service has time to update
    setTimeout(() => {
      fetchPendingBookings();
    }, 300);
  };

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
