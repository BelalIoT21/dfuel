
import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/services/apiService';
import { useIsMobile } from '@/hooks/use-mobile';
import { BookingsList } from '@/components/admin/bookings/BookingsList';
import { BookingsCardList } from '@/components/admin/bookings/BookingsCardList';

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

    if (user?.isAdmin) {
      fetchBookings();
    }
  }, [user]);

  // Filter bookings based on selected filter
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter((booking: any) => booking.status.toLowerCase() === filter);

  // Handle approval or rejection
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      // Call API to update the booking status
      const response = await apiService.updateBookingStatus(bookingId, newStatus);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update the local state to reflect the change
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

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader />
        
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
            ) : isMobile ? (
              <BookingsCardList 
                bookings={filteredBookings} 
                handleStatusChange={handleStatusChange}
                filter={filter}
                setFilter={setFilter}
              />
            ) : (
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
                    <BookingsList 
                      bookings={filteredBookings} 
                      handleStatusChange={handleStatusChange}
                      filter={filter}
                      setFilter={setFilter}
                    />
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveBookings;
