
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

// Import mock data service for now
import { localStorageService } from '@/services/localStorageService';

export const PendingBookingsCard = () => {
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load pending bookings
  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        // In a real app, this would be an API call to get pending bookings
        const users = localStorageService.getAllUsers();
        const allBookings = [];
        
        // Collect all bookings with their user info
        users.forEach(user => {
          if (user.bookings && user.bookings.length > 0) {
            user.bookings.forEach(booking => {
              if (booking.status === 'Pending') {
                allBookings.push({
                  ...booking,
                  userName: user.name,
                  userEmail: user.email,
                  userId: user.id
                });
              }
            });
          }
        });
        
        console.log('Pending bookings found:', allBookings.length);
        setPendingBookings(allBookings);
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
  const handleApproveBooking = async (bookingId, userId) => {
    try {
      // Update the booking status in local storage
      const success = localStorageService.updateBookingStatus(userId, bookingId, 'Approved');
      
      if (success) {
        // Update the local state
        setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
        toast({
          title: "Booking Approved",
          description: "The booking has been approved successfully",
        });
      } else {
        throw new Error("Failed to update booking");
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
  const handleRejectBooking = async (bookingId, userId) => {
    try {
      // Update the booking status in local storage
      const success = localStorageService.updateBookingStatus(userId, bookingId, 'Rejected');
      
      if (success) {
        // Update the local state
        setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
        toast({
          title: "Booking Rejected",
          description: "The booking has been rejected",
        });
      } else {
        throw new Error("Failed to update booking");
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

  // Get machine name
  const getMachineName = (machineId) => {
    const machines = localStorageService.getAllMachines();
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : 'Unknown Machine';
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
              <div key={booking.id} className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{getMachineName(booking.machineId)}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <User className="h-3 w-3" />
                      <span>{booking.userName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{booking.date}</span>
                      <Clock className="h-3 w-3 ml-1" />
                      <span>{booking.time}</span>
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
                            <p className="text-gray-700 mb-4">{getMachineName(selectedBooking.machineId)}</p>
                            
                            <h3 className="font-semibold mb-2">User</h3>
                            <p className="text-gray-700">{selectedBooking.userName}</p>
                            <p className="text-gray-500 text-sm mb-4">{selectedBooking.userEmail}</p>
                            
                            <h3 className="font-semibold mb-2">Date & Time</h3>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {selectedBooking.date}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 mt-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {selectedBooking.time}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => handleRejectBooking(selectedBooking.id, selectedBooking.userId)}
                              className="border-red-200 hover:bg-red-50 text-red-600"
                            >
                              Reject
                            </Button>
                            <Button 
                              onClick={() => handleApproveBooking(selectedBooking.id, selectedBooking.userId)}
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
                    onClick={() => handleRejectBooking(booking.id, booking.userId)}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs h-8 bg-green-600 hover:bg-green-700 ml-auto"
                    onClick={() => handleApproveBooking(booking.id, booking.userId)}
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
