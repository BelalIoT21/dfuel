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

const ActiveBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges",
        variant: "destructive"
      });
      navigate('/home');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllBookings();
        if (response.data) {
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

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter((booking: any) => booking.status.toLowerCase() === filter);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await apiService.updateBookingStatus(bookingId, newStatus);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setBookings(bookings.map((booking: any) => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      toast({
        title: `Booking ${newStatus}`,
        description: `You have ${newStatus.toLowerCase()} booking #${bookingId}`,
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }
  
  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => navigate('/home')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const renderMobileView = () => (
    <div className="space-y-4">
      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking: any) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{booking.machineName}</CardTitle>
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
                <span className="font-medium">User:</span> {booking.userName}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm mb-3">
                <span className="font-medium">Date & Time:</span> {booking.date} at {booking.time}
              </p>
              
              {booking.status === 'Pending' ? (
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-500 hover:bg-green-600 flex items-center justify-center gap-1 w-full"
                    onClick={() => handleStatusChange(booking.id, 'Approved')}
                  >
                    <CheckCircle size={16} />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="flex items-center justify-center gap-1 w-full"
                    onClick={() => handleStatusChange(booking.id, 'Rejected')}
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
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.machineName}</TableCell>
                <TableCell>{booking.userName}</TableCell>
                <TableCell>
                  {booking.date} at {booking.time}
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
                        onClick={() => handleStatusChange(booking.id, 'Approved')}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={() => handleStatusChange(booking.id, 'Rejected')}
                      >
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="border-purple-200 whitespace-nowrap">
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
