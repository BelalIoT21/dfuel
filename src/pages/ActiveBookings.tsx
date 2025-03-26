
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import BookingDetailsDialog from '@/components/profile/BookingDetailsDialog';

const ActiveBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);

  useEffect(() => {
    console.log("ActiveBookings component mounted");
    
    if (!user) {
      console.log("No user found, redirecting to login");
      toast({
        title: "Authentication Required",
        description: "Please log in to view your bookings",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        console.log('Fetching bookings for user:', user.id);
        
        // If admin, fetch all bookings, otherwise fetch user's bookings
        const userBookings = user.isAdmin 
          ? await bookingService.getAllBookings()
          : await bookingService.getUserBookings(user.id);
          
        console.log('Retrieved bookings:', userBookings);
        
        // Sort bookings by date and time
        const sortedBookings = [...userBookings].sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        setBookings(sortedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load your bookings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate, toast]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setDeletingBookingId(bookingId); // Set currently deleting booking
      
      const success = await bookingService.cancelBooking(bookingId);
      if (success) {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been successfully cancelled",
        });
        // Immediately update the booking list in UI
        setBookings(prev => prev.filter(booking => 
          (booking.id !== bookingId && booking._id !== bookingId)
        ));
        // Close dialog if open
        if (dialogOpen && selectedBooking && 
            (selectedBooking.id === bookingId || selectedBooking._id === bookingId)) {
          setDialogOpen(false);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to cancel booking",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setDeletingBookingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewMachine = (machineId: string) => {
    if (!machineId) {
      toast({
        title: "Error",
        description: "Machine information is missing",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Navigating to machine ${machineId}`);
    navigate(`/machine/${machineId}`);
  };

  const getBackDestination = () => {
    if (user?.isAdmin) {
      return '/admin';
    }
    return '/home';
  };

  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Button
        variant="ghost"
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        onClick={() => navigate(getBackDestination())}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to {user?.isAdmin ? 'Admin Dashboard' : 'Home'}
      </Button>

      <Card className="shadow-lg border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
          <CardTitle className="text-2xl text-purple-800">
            {user?.isAdmin ? 'All Bookings' : 'Your Bookings'}
          </CardTitle>
          <CardDescription>
            {user?.isAdmin 
              ? 'Manage all machine booking appointments' 
              : 'Manage your machine booking appointments'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500 mb-4">
                {user?.isAdmin 
                  ? 'There are no active bookings in the system' 
                  : 'You don\'t have any active bookings'}
              </p>
              <Button onClick={() => navigate('/profile?tab=certifications')} className="bg-purple-600 hover:bg-purple-700">
                Browse Machines
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => {
                const bookingId = booking.id || booking._id;
                if (deletingBookingId === bookingId) return null; // Skip rendering if being deleted
                
                return (
                  <div key={bookingId} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg">{booking.machineName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    {user?.isAdmin && (
                      <div className="mb-2">
                        <span className="text-gray-500 text-sm">User: </span>
                        <span className="font-medium">{booking.userName || 'Unknown User'}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <div>
                        <span className="text-gray-500 text-sm">Date: </span>
                        <span>{format(new Date(booking.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Time: </span>
                        <span>{booking.time}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'approved' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => handleCancelBooking(bookingId)}
                          disabled={deletingBookingId !== null}
                        >
                          {deletingBookingId === bookingId ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            'Cancel Booking'
                          )}
                        </Button>
                      ) : null}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => handleViewBookingDetails(booking)}
                      >
                        View Booking
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Booking Details Dialog */}
          <BookingDetailsDialog
            booking={selectedBooking}
            open={dialogOpen}
            onClose={handleCloseDialog}
            onCancel={(booking) => handleCancelBooking(booking.id || booking._id)}
            canCancel={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveBookings;
