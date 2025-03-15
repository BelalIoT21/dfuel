
import { useState, useEffect } from 'react';
import { PendingBookingsCard } from "./PendingBookingsCard";
import { bookingService } from '@/services/bookingService';

export const PendingActions = () => {
  const [hasPendingBookings, setHasPendingBookings] = useState(false);
  
  useEffect(() => {
    const checkPendingBookings = async () => {
      try {
        // Get all bookings and check if any are pending
        const allBookings = await bookingService.getAllBookings();
        console.log(`Found ${allBookings.length} total bookings`);
        
        const pendingBookings = allBookings.filter(booking => booking.status === 'Pending');
        console.log(`Found ${pendingBookings.length} pending bookings`);
        
        setHasPendingBookings(pendingBookings.length > 0);
      } catch (error) {
        console.error('Error checking pending bookings:', error);
        setHasPendingBookings(false);
      }
    };
    
    checkPendingBookings();
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Actions</h2>
      <div className="space-y-4">
        <PendingBookingsCard />
      </div>
    </div>
  );
};
