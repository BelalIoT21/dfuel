
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { bookingService } from '@/services/bookingService';
import { PendingBookingsCard } from './PendingBookingsCard';

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPendingBookings = async () => {
    try {
      console.log("Fetching bookings for admin view...");
      setLoading(true);
      
      const bookings = await bookingService.getAllBookings();
      console.log("Received bookings from service:", bookings.length);
      
      // Filter out just the pending ones
      const pending = bookings.filter(booking => booking.status === 'Pending');
      console.log("Pending bookings:", pending.length);
      
      setPendingBookings(pending);
      setError(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const handleBookingStatusChange = () => {
    console.log("Booking status changed, refreshing pending bookings...");
    fetchPendingBookings();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pending Actions</CardTitle>
        <CardDescription>Review and approve booking requests</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-4">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 bg-red-50 rounded-md text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchPendingBookings} 
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <PendingBookingsCard 
            pendingBookings={pendingBookings} 
            onBookingStatusChange={handleBookingStatusChange}
          />
        )}
      </CardContent>
    </Card>
  );
};
