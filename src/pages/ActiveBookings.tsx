
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/services/bookingService';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ChevronLeft, Loader2, ClipboardList } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'Approved':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'Completed':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'Canceled':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    case 'Rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const ActiveBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchBookings = async () => {
    try {
      setRefreshing(true);
      console.log('Fetching bookings directly from MongoDB');
      
      // Admin gets all bookings, regular user gets their own
      const allBookings = user?.isAdmin 
        ? await bookingService.getAllBookings()
        : await bookingService.getUserBookings(user?.id || user?._id);
      
      console.log(`Found ${allBookings.length} bookings in MongoDB`);
      
      if (allBookings.length === 0) {
        console.log('Falling back to bookingService');
        const serviceBookings = await bookingService.getAllBookings();
        console.log(`Found ${serviceBookings.length} total bookings via bookingService`);
        setBookings(serviceBookings);
      } else {
        setBookings(allBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const pendingBookings = useMemo(() => {
    console.log('All bookings before filtering:', bookings);
    const filtered = bookings.filter(booking => booking.status === 'Pending');
    console.log(`Found ${filtered.length} pending bookings:`, filtered);
    return filtered;
  }, [bookings]);

  // Auto refresh pending bookings every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (pendingBookings.length > 0) {
        console.log('Auto-refreshing pending bookings');
        fetchBookings();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [pendingBookings]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const success = await bookingService.cancelBooking(bookingId);
      if (success) {
        toast({
          title: 'Booking Canceled',
          description: 'Your booking has been successfully canceled',
        });
        fetchBookings();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to cancel booking',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold flex-1">
          {user?.isAdmin ? 'All Bookings' : 'My Bookings'}
        </h1>
        <Button 
          onClick={fetchBookings} 
          variant="outline" 
          disabled={refreshing}
          className="ml-2"
        >
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : 'Refresh'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            {user?.isAdmin ? 'All Machine Bookings' : 'Your Machine Bookings'}
          </CardTitle>
          <CardDescription>
            View and manage your machine reservations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No bookings found</p>
              <Link to="/home">
                <Button>Browse Machines</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableCaption>
                {user?.isAdmin 
                  ? 'All machine bookings in the system' 
                  : 'Your machine booking history'}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  {user?.isAdmin && <TableHead>User</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id || booking.id}>
                    <TableCell className="font-medium">
                      {booking.machineName || 'Unknown Machine'}
                    </TableCell>
                    {user?.isAdmin && (
                      <TableCell>
                        {booking.userName || 'Unknown User'}
                      </TableCell>
                    )}
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'Pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking._id || booking.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                      {user?.isAdmin && booking.status === 'Pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const success = await bookingService.updateBookingStatus(
                                booking._id || booking.id,
                                'Approved'
                              );
                              if (success) {
                                toast({
                                  title: 'Booking Approved',
                                  description: 'The booking has been approved',
                                });
                                fetchBookings();
                              }
                            }}
                            className="text-green-600 border-green-200 hover:bg-green-50 ml-2"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const success = await bookingService.updateBookingStatus(
                                booking._id || booking.id,
                                'Rejected'
                              );
                              if (success) {
                                toast({
                                  title: 'Booking Rejected',
                                  description: 'The booking has been rejected',
                                });
                                fetchBookings();
                              }
                            }}
                            className="text-red-600 border-red-200 hover:bg-red-50 ml-2"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveBookings;
