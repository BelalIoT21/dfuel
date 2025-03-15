
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Clock, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { apiService } from '@/services/apiService';
import { userDatabaseService } from '@/services/database/userService';
import { bookingService } from '@/services/bookingService';

export const PendingBookingsCard = () => {
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load pending bookings
  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        setLoading(true);
        console.log('Fetching pending bookings...');
        
        // Get all bookings and filter for pending only
        const response = await apiService.getAllBookings();
        if (response && response.data) {
          const allBookings = response.data;
          const pendingOnly = allBookings.filter(booking => booking.status === 'Pending');
          console.log('Pending bookings found via API:', pendingOnly.length);
          setPendingBookings(pendingOnly);
          setLoading(false);
          return;
        }
        
        // If API fails, try getting all bookings and filtering
        const allBookings = await bookingService.getAllBookings();
        const pendingOnly = allBookings.filter(booking => booking.status === 'Pending');
        console.log('Pending bookings found:', pendingOnly.length);
        setPendingBookings(pendingOnly);
      } catch (error) {
        console.error('Error fetching pending bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load pending bookings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBookings();
  }, []);

  // Handle booking approval
  const handleApproveBooking = async (booking) => {
    try {
      console.log(`Approving booking: ${booking._id || booking.id}`);
      const bookingId = booking._id || booking.id;
      
      const success = await bookingService.updateBookingStatus(bookingId, 'Approved');
      
      if (success) {
        // Update the local state by removing the approved booking
        setPendingBookings(prevBookings => 
          prevBookings.filter(b => (b._id || b.id) !== bookingId)
        );
        
        toast({
          title: "Booking Approved",
          description: "The booking has been approved successfully.",
        });
      } else {
        throw new Error("Failed to update booking status");
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      toast({
        title: "Error",
        description: "Failed to approve the booking",
        variant: "destructive",
      });
    }
  };

  // Handle booking rejection
  const handleRejectBooking = async (booking) => {
    try {
      console.log(`Rejecting booking: ${booking._id || booking.id}`);
      const bookingId = booking._id || booking.id;
      
      const success = await bookingService.updateBookingStatus(bookingId, 'Rejected');
      
      if (success) {
        // Update the local state by removing the rejected booking
        setPendingBookings(prevBookings => 
          prevBookings.filter(b => (b._id || b.id) !== bookingId)
        );
        
        toast({
          title: "Booking Rejected",
          description: "The booking has been rejected.",
          variant: "destructive",
        });
      } else {
        throw new Error("Failed to update booking status");
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast({
        title: "Error",
        description: "Failed to reject the booking",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-purple-100">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Calendar className="h-5 w-5 text-purple-600" />
          Pending Bookings
        </CardTitle>
        <CardDescription>Bookings that require your approval</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {loading ? (
          <div className="text-center py-4">Loading pending bookings...</div>
        ) : pendingBookings.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No pending bookings at this time</div>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div key={booking._id || booking.id} className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{booking.machineName || `Machine ID: ${booking.machineId}`}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <User className="h-3 w-3" />
                      <span>{booking.userName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{booking.date ? new Date(booking.date).toLocaleDateString() : 'Unknown Date'}</span>
                      <Clock className="h-3 w-3 ml-1" />
                      <span>{booking.time || 'Unknown Time'}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                    Pending
                  </Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      {selectedBooking && (
                        <>
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>
                              Review the booking information before making a decision
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <h3 className="font-semibold mb-2">Machine</h3>
                            <p className="text-gray-700 mb-4">{selectedBooking.machineName || `Machine ID: ${selectedBooking.machineId}`}</p>
                            
                            <h3 className="font-semibold mb-2">User</h3>
                            <p className="text-gray-700">{selectedBooking.userName}</p>
                            <p className="text-gray-500 text-sm mb-4">{selectedBooking.userEmail}</p>
                            
                            <h3 className="font-semibold mb-2">Date & Time</h3>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString() : 'Unknown Date'}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 mt-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {selectedBooking.time || 'Unknown Time'}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                handleRejectBooking(selectedBooking);
                                document.querySelector('[data-state="open"][role="dialog"]')?.dispatchEvent(
                                  new KeyboardEvent('keydown', { key: 'Escape' })
                                );
                              }}
                              className="border-red-200 hover:bg-red-50 text-red-600"
                            >
                              Reject
                            </Button>
                            <Button 
                              onClick={() => {
                                handleApproveBooking(selectedBooking);
                                document.querySelector('[data-state="open"][role="dialog"]')?.dispatchEvent(
                                  new KeyboardEvent('keydown', { key: 'Escape' })
                                );
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 border-red-200 hover:bg-red-50 text-red-600"
                    onClick={() => handleRejectBooking(booking)}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs h-8 bg-green-600 hover:bg-green-700 ml-auto"
                    onClick={() => handleApproveBooking(booking)}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
