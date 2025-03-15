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
  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

  // Fetch bookings data from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllBookings();
        if (response.data) {
          console.log('Received bookings:', response.data);
          setBookings(response.data);
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

    fetchBookings();
  }, []);

  // Filter bookings based on selected filter
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter((booking: any) => booking.status.toLowerCase() === filter.toLowerCase());

  // Handle approval or rejection
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      console.log(`Updating booking ${bookingId} status to ${newStatus}`);
      
      // Call API to update the booking status
      const response = await apiService.updateBookingStatus(bookingId, newStatus);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update the local state to reflect the change
      setBookings(bookings.map((booking: any) => 
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      toast({
        title: `Booking ${newStatus}`,
        description: `You have ${newStatus.toLowerCase()} the booking`,
        variant: newStatus === 'Approved' ? 'default' : 'destructive',
      });
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
          <Card key={booking._id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{booking.machineName || 'Unknown Machine'}</CardTitle>
                <Badge variant={booking.status === 'Approved' ? 'default' : 'outline'} 
                      className={`
                        ${booking.status === 'Approved' && 'bg-green-500 hover:bg-green-600'} 
                        ${booking.status === 'Pending' && 'bg-yellow-500 hover:bg-yellow-600'} 
                        ${booking.status === 'Rejected' && 'bg-red-500 hover:bg-red-600'}
                      `}>
                  {booking.status}
                </Badge>
              </div>
              <CardDescription>
                <span className="font-medium">User:</span> {booking.userName || 'Unknown User'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm mb-3">
                <span className="font-medium">Date & Time:</span> {new Date(booking.date).toLocaleDateString()} at {booking.time}
              </p>
              
              {booking.status === 'Pending' ? (
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-500 hover:bg-green-600 flex items-center justify-center gap-1 w-full"
                    onClick={() => handleStatusChange(booking._id, 'Approved')}
                  >
                    <CheckCircle size={16} />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="flex items-center justify-center gap-1 w-full"
                    onClick={() => handleStatusChange(booking._id, 'Rejected')}
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
              <TableRow key={booking._id}>
                <TableCell className="font-medium">{booking.machineName || 'Unknown Machine'}</TableCell>
                <TableCell>{booking.userName || 'Unknown User'}</TableCell>
                <TableCell>
                  {new Date(booking.date).toLocaleDateString()} at {booking.time}
                </TableCell>
                <TableCell>
                  <Badge variant={booking.status === 'Approved' ? 'default' : 'outline'} 
                        className={`
                          ${booking.status === 'Approved' && 'bg-green-500 hover:bg-green-600'} 
                          ${booking.status === 'Pending' && 'bg-yellow-500 hover:bg-yellow-600'} 
                          ${booking.status === 'Rejected' && 'bg-red-500 hover:bg-red-600'}
                        `}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {booking.status === 'Pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 flex items-center gap-1"
                        onClick={() => handleStatusChange(booking._id, 'Approved')}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={() => handleStatusChange(booking._id, 'Rejected')}
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
