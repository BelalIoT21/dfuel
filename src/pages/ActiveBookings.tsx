
import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/services/apiService';
import { useIsMobile } from '@/hooks/use-mobile';
import { bookingService } from '@/services/bookingService';

const ActiveBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Redirect if not admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch bookings data from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        // Try using the bookingService first
        const allBookings = await bookingService.getAllBookings();
        
        if (allBookings && allBookings.length > 0) {
          console.log('Received bookings from service:', allBookings.length);
          setBookings(allBookings);
          setLoading(false);
          return;
        }
        
        // Fall back to direct API call
        const response = await apiService.getAllBookings();
        if (response.data) {
          console.log('Received bookings from API:', response.data.length);
          setBookings(response.data);
        } else {
          console.log('No bookings received from API');
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load bookings data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchBookings();
    }
  }, [user]);

  // Filter bookings based on selected filter
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter((booking: any) => booking.status?.toLowerCase() === filter.toLowerCase());

  // Function to get the badge variant based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'canceled':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Handle approval or rejection
  const handleStatusChange = async (booking: any, newStatus: 'Approved' | 'Rejected' | 'Completed' | 'Canceled') => {
    try {
      const bookingId = booking._id || booking.id;
      console.log(`Updating booking ${bookingId} status to ${newStatus}`);
      
      // Use the bookingService to update status
      const success = await bookingService.updateBookingStatus(bookingId, newStatus);
      
      if (success) {
        // Update the local state to reflect the change
        setBookings(prevBookings => prevBookings.map((b: any) => 
          (b._id || b.id) === bookingId ? { ...b, status: newStatus } : b
        ));
        
        toast({
          title: `Booking ${newStatus}`,
          description: `You have ${newStatus.toLowerCase()} the booking`,
          variant: newStatus === 'Approved' ? 'default' : 'destructive',
        });
      } else {
        throw new Error("Failed to update booking status");
      }
    } catch (error) {
      console.error(`Error updating booking status:`, error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  // Render mobile card view for small screens
  const renderMobileView = () => (
    <div className="space-y-4">
      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking: any) => (
          <Card key={booking._id || booking.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{booking.machineName || 'Unknown Machine'}</CardTitle>
                <Badge variant="default" className={getStatusBadgeClass(booking.status)}>
                  {booking.status || 'Unknown'}
                </Badge>
              </div>
              <CardDescription>
                <span className="font-medium">User:</span> {booking.userName || 'Unknown User'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm mb-3">
                <span className="font-medium">Date & Time:</span> {booking.date ? new Date(booking.date).toLocaleDateString() : 'Unknown Date'} at {booking.time || 'Unknown Time'}
              </p>
              
              {booking.status === 'Pending' ? (
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-500 hover:bg-green-600 flex items-center justify-center gap-1 w-full"
                    onClick={() => handleStatusChange(booking, 'Approved')}
                  >
                    <CheckCircle size={16} />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="flex items-center justify-center gap-1 w-full"
                    onClick={() => handleStatusChange(booking, 'Rejected')}
                  >
                    <XCircle size={16} />
                    Reject
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="border-purple-200 w-full">
                  View Details
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p className="mb-2">No bookings found matching the selected filter.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => setFilter('all')}
          >
            View All Bookings
          </Button>
        </div>
      )}
    </div>
  );

  // Render desktop table view for larger screens
  const renderDesktopView = () => (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Machine</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking: any) => (
              <TableRow key={booking._id || booking.id}>
                <TableCell className="font-medium">{booking.machineName || 'Unknown Machine'}</TableCell>
                <TableCell>{booking.userName || 'Unknown User'}</TableCell>
                <TableCell>
                  {booking.date ? new Date(booking.date).toLocaleDateString() : 'Unknown Date'} at {booking.time || 'Unknown Time'}
                </TableCell>
                <TableCell>
                  <Badge variant="default" className={getStatusBadgeClass(booking.status)}>
                    {booking.status || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {booking.status === 'Pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 flex items-center gap-1"
                        onClick={() => handleStatusChange(booking, 'Approved')}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={() => handleStatusChange(booking, 'Rejected')}
                      >
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="border-purple-200">
                      View Details
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                <p className="mb-2">No bookings found matching the selected filter.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setFilter('all')}
                >
                  View All Bookings
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader pageTitle="Booking Management" />
        
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Active Bookings</CardTitle>
              <CardDescription>Manage machine booking requests and reservations</CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading bookings...</p>
              </div>
            ) : (
              isMobile ? renderMobileView() : renderDesktopView()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveBookings;
