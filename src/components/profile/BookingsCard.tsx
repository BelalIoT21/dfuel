
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, PlusCircle, Loader2 } from "lucide-react";
import { bookingService } from '@/services/bookingService';
import { machineService } from '@/services/machineService';
import BookingsList from './BookingsList';
import EmptyBookingsView from './EmptyBookingsView';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookingsCard = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const fetchBookings = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log(`Fetching bookings for user: ${user.id}`);
      const userBookings = await bookingService.getUserBookings(user.id);
      console.log('Received bookings:', userBookings);
      setBookings(userBookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  const getMachineName = useCallback(async (machineId) => {
    if (!machineId) return 'Unknown Machine';
    
    try {
      const machine = await machineService.getMachineById(machineId);
      return machine?.name || 'Unknown Machine';
    } catch (error) {
      console.error(`Error fetching machine ${machineId}:`, error);
      return 'Unknown Machine';
    }
  }, []);
  
  const handleViewDetails = (booking) => {
    // View booking details implementation
    console.log('View booking details:', booking);
  };
  
  const handleDeleteBooking = useCallback((booking) => {
    console.log('Booking deleted:', booking);
    // Remove the booking from the state
    setBookings(prevBookings => 
      prevBookings.filter(b => 
        (b.id !== booking.id && b._id !== booking._id)
      )
    );
    // Refetch after a short delay to ensure server sync
    setTimeout(() => {
      fetchBookings();
    }, 1000);
  }, [fetchBookings]);
  
  const navigateToMachineBooking = () => {
    navigate('/machines');
  };
  
  if (isLoading) {
    return (
      <Card className="border-purple-100 shadow-md">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your bookings...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-purple-100 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium">Your Bookings</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-purple-200 hover:bg-purple-50"
            onClick={navigateToMachineBooking}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            New Booking
          </Button>
        </div>
        
        {bookings.length === 0 ? (
          <EmptyBookingsView />
        ) : (
          <BookingsList 
            bookings={bookings} 
            getMachineName={getMachineName}
            onViewDetails={handleViewDetails}
            onDeleteBooking={handleDeleteBooking}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsCard;
