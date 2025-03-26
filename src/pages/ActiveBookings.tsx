import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/services/bookingService';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const ActiveBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        const userBookings = await bookingService.getUserBookings(user.id);
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
      const success = await bookingService.cancelBooking(bookingId);
      if (success) {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been successfully cancelled",
        });
        // Update the booking list
        setBookings(bookings.filter(booking => booking.id !== bookingId));
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

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Button
        variant="ghost"
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="shadow-lg border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
          <CardTitle className="text-2xl text-purple-800">Your Bookings</CardTitle>
          <CardDescription>Manage your machine booking appointments</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500 mb-4">You don't have any active bookings</p>
              <Button onClick={() => navigate('/home')} className="bg-purple-600 hover:bg-purple-700">
                Browse Machines
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <h3 className="font-medium text-lg">{booking.machineName}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
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
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    ) : null}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => handleViewMachine(booking.machineId)}
                    >
                      View Machine
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveBookings;
