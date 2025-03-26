
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Calendar, RefreshCw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '@/services/bookingService';
import BookingsList from './BookingsList';
import EmptyBookingsView from './EmptyBookingsView';
import { Loader2 } from 'lucide-react';

const BookingsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      console.log(`Fetching bookings for user: ${user.id}`);
      const userBookings = await bookingService.getUserBookings(user.id);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleNewBooking = () => {
    // Navigate to certifications tab instead of booking page
    navigate('/profile?tab=certifications');
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  const handleDeleteBooking = async (deletedBooking) => {
    // Remove the booking from the state immediately
    const bookingId = deletedBooking.id || deletedBooking._id;
    setBookings(currentBookings => 
      currentBookings.filter(booking => (booking.id || booking._id) !== bookingId)
    );
    
    // Optionally refresh the list after a short delay
    setTimeout(fetchBookings, 1000);
  };

  if (!user) return null;

  return (
    <Card className="border-purple-100">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} className="text-purple-600" />
            Your Bookings
          </CardTitle>
          <CardDescription>Manage your machine bookings</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNewBooking}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <div>Loading bookings...</div>
          </div>
        ) : bookings.length > 0 ? (
          <BookingsList 
            bookings={bookings} 
            onDeleteBooking={handleDeleteBooking} 
            getMachineName={(id) => {
              const booking = bookings.find(b => (b.machineId || b.machine) === id);
              return booking?.machineName || `Machine ${id}`;
            }}
          />
        ) : (
          <EmptyBookingsView />
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsCard;
