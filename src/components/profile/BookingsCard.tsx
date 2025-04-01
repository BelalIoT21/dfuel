
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Calendar, RefreshCw, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingService } from '@/services/bookingService';
import BookingsList from './BookingsList';
import EmptyBookingsView from './EmptyBookingsView';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const BookingsCard = () => {
  // Wrap the useAuth call in a try-catch to handle the case when AuthProvider is not available
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    console.error('Error using Auth context in BookingsCard:', error);
  }

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchBookings = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      console.log(`Fetching bookings for user: ${user.id}`);
      const userBookings = await bookingService.getUserBookings(user.id);
      setBookings(Array.isArray(userBookings) ? userBookings : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Don't show error toast for empty bookings
      if (error.message !== "No bookings found") {
        toast({
          title: "Note",
          description: "You don't have any bookings yet.",
          variant: "default"
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleNewBooking = () => {
    // Changed to navigate to the certifications tab in profile
    setSearchParams({ tab: 'certifications' });
    toast({
      title: "Check Your Certifications",
      description: "Make sure you have the needed certifications before booking a machine",
    });
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
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} className="text-purple-600 flex-shrink-0" />
            Your Bookings
          </CardTitle>
          <CardDescription>Manage your machine bookings</CardDescription>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="h-9 w-9 p-0 sm:w-auto sm:p-2"
          >
            {refreshing ? 
              <Loader2 className="h-4 w-4 animate-spin" /> : 
              <RefreshCw className="h-4 w-4 sm:mr-1" />
            }
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNewBooking}
            className="flex items-center gap-1 ml-auto sm:ml-0 flex-grow sm:flex-grow-0"
          >
            <Plus className="h-4 w-4" />
            <span>New Booking</span>
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
