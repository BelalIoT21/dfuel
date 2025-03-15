
import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../.././server/src/components/admin/AdminHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../.././server/src/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../.././server/src/components/ui/table";
import { Button } from "../.././server/src/components/ui/button";
import { useAuth } from '../context/AuthContext';
import { Badge } from '../.././server/src/components/ui/badge';
import { CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../.././server/src/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from '../.././server/src/components/ui/use-toast';
import { useIsMobile } from '../hooks/use-mobile';
import { bookingService } from '../services/bookingService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../.././server/src/components/ui/dialog";

const ActiveBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  interface Booking {
    _id?: string;
    id?: string;
    machineName?: string;
    machineType?: string;
    userName?: string;
    userEmail?: string;
    date?: string;
    time?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  
  // Redirect if not admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch bookings data from API
  const loadBookings = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching bookings for admin view...");
      // Try using the bookingService first
      const allBookings = await bookingService.getAllBookings();
      
      if (allBookings && allBookings.length >= 0) {
        console.log('Received bookings from service:', allBookings.length);
        setBookings(allBookings);
      } else {
        console.log('No bookings received');
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      loadBookings();
    }
  }, [user]);

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadBookings();
    toast({
      title: "Refreshing",
      description: "Updating bookings list...",
    });
  };

  // Filter bookings based on selected filter
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter((booking: any) => booking.status?.toLowerCase() === filter.toLowerCase());

  // Function to get the badge variant based on status
  const getStatusBadgeClass = (status: string = 'unknown') => {
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
          ((b._id && b._id === bookingId) || (b.id && b.id === bookingId)) 
            ? { ...b, status: newStatus } 
            : b
        ));
        
        toast({
          title: `Booking ${newStatus}`,
          description: `You have ${newStatus.toLowerCase()} the booking`,
          variant: newStatus === 'Approved' ? 'default' : 'destructive',
        });
        
        // Close dialog if open
        setIsDialogOpen(false);
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
  
  // Handle booking deletion
  const handleDeleteBooking = async (booking: any) => {
    try {
      const bookingId = booking._id || booking.id;
      console.log(`Deleting booking ${bookingId}`);
      
      const success = await bookingService.deleteBooking(bookingId);
      
      if (success) {
        // Update the local state to remove the booking
        setBookings(prevBookings => prevBookings.filter((b: any) => 
          !((b._id === bookingId) || (b.id === bookingId))
        ));
        
        toast({
          title: "Booking Deleted",
          description: "The booking has been removed",
        });
        
        // Close dialog if open
        setIsDialogOpen(false);
        
        // Force refresh to ensure everything is consistent
        setTimeout(() => {
          loadBookings();
        }, 1000);
      } else {
        throw new Error("Failed to delete booking");
      }
    } catch (error) {
      console.error(`Error deleting booking:`, error);
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    }
  };
  
  // Handle view details
  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
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
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-purple-200 w-full"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 w-full"
                    onClick={() => handleDeleteBooking(booking)}
                  >
                    Delete Booking
                  </Button>
                </div>
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
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-purple-200"
                        onClick={() => handleViewDetails(booking)}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteBooking(booking)}
                      >
                        Delete
                      </Button>
                    </div>
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
            <div className="w-full sm:w-48 flex gap-2 items-center">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                Refresh
              </Button>
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
      
      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>
                  Detailed information about this booking
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <h3 className="font-semibold mb-2">Machine</h3>
                <p className="text-gray-700 mb-1">{selectedBooking.machineName || 'Unknown Machine'}</p>
                <p className="text-gray-500 text-sm mb-4">Type: {selectedBooking.machineType || 'N/A'}</p>
                
                <h3 className="font-semibold mb-2">User</h3>
                <p className="text-gray-700">{selectedBooking.userName || 'Unknown User'}</p>
                <p className="text-gray-500 text-sm mb-4">{selectedBooking.userEmail || 'No email'}</p>
                
                <h3 className="font-semibold mb-2">Date & Time</h3>
                <p className="text-gray-700 mb-4">
                  {selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString() : 'Unknown Date'} at {selectedBooking.time || 'Unknown Time'}
                </p>
                
                <h3 className="font-semibold mb-2">Status</h3>
                <Badge className={getStatusBadgeClass(selectedBooking.status || 'unknown')}>
                  {selectedBooking.status || 'Unknown'}
                </Badge>
                
                <div className="text-gray-500 text-xs mt-6">
                  <p>Booking ID: {selectedBooking._id || selectedBooking.id || 'Unknown'}</p>
                  <p>Created: {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : 'Unknown'}</p>
                  <p>Last Updated: {selectedBooking.updatedAt ? new Date(selectedBooking.updatedAt).toLocaleString() : 'Unknown'}</p>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline"
                  className="border-red-200 hover:bg-red-50 text-red-600"
                  onClick={() => handleDeleteBooking(selectedBooking)}
                >
                  Delete Booking
                </Button>
                
                {selectedBooking.status === 'Pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusChange(selectedBooking, 'Rejected')}
                      className="border-red-200 hover:bg-red-50 text-red-600"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange(selectedBooking, 'Approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'Approved' && (
                  <Button 
                    onClick={() => handleStatusChange(selectedBooking, 'Completed')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Mark as Completed
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveBookings;
