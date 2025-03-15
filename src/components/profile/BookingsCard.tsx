
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { machines } from '../../utils/data';
import { Mail, Calendar, Info, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { machineService } from '@/services/machineService';
import { bookingService } from '@/services/bookingService';
import mongoDbService from '@/services/mongoDbService';

const BookingsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [machineNames, setMachineNames] = useState<{[key: string]: string}>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const fetchMachineNames = async () => {
      const names: {[key: string]: string} = {};
      if (user?.bookings && user.bookings.length > 0) {
        for (const booking of user.bookings) {
          try {
            const machine = await machineService.getMachineById(booking.machineId);
            if (machine) {
              names[booking.machineId] = machine.name;
            }
          } catch (error) {
            console.error(`Error fetching machine ${booking.machineId}:`, error);
          }
        }
      }
      setMachineNames(names);
    };
    
    if (user) {
      fetchMachineNames();
    }
  }, [user]);
  
  if (!user) return null;

  const handleBookMachine = () => {
    // Direct update of search params for better tab switching
    setSearchParams({ tab: 'certifications' });
  };

  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleDeleteBooking = (booking: any) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    setIsProcessing(true);
    
    try {
      // Try MongoDB first for direct database deletion
      let success = false;
      try {
        success = await mongoDbService.deleteBooking(bookingToDelete.id);
        console.log(`MongoDB deleteBooking result: ${success}`);
      } catch (mongoError) {
        console.error("MongoDB delete booking error:", mongoError);
      }
      
      // If MongoDB fails, try the regular service
      if (!success) {
        success = await bookingService.deleteBooking(bookingToDelete.id);
      }
      
      if (success) {
        toast({
          title: "Booking Deleted",
          description: "Your booking has been deleted successfully.",
        });
        
        // Update user state to remove the booking
        if (user.bookings) {
          const updatedBookings = user.bookings.filter(b => b.id !== bookingToDelete.id);
          // This is a bit hacky, but it will force a re-render
          const updatedUser = {...user, bookings: updatedBookings};
          localStorage.setItem('learnit_user', JSON.stringify(updatedUser));
          // Force a page refresh to update the UI
          window.location.reload();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete booking. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the booking.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCancelBooking = (booking: any) => {
    toast({
      title: "Cancel Booking",
      description: "Booking cancellation functionality will be implemented soon.",
    });
  };

  const getMachineName = (machineId: string) => {
    // First try to use the pre-fetched machine names
    if (machineNames[machineId]) {
      return machineNames[machineId];
    }
    
    // Fall back to map if needed
    const machineMap = {
      '1': 'Laser Cutter',
      '2': 'Ultimaker',
      '3': 'X1 E Carbon 3D Printer',
      '4': 'Bambu Lab X1 E',
      '5': 'Soldering Station'
    };
    
    return machineMap[machineId] || `Machine ${machineId}`;
  };

  const getMachineType = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.type : "Unknown";
  };

  return (
    <>
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} className="text-purple-600" />
            Your Bookings
          </CardTitle>
          <CardDescription>Recent and upcoming bookings</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {user.bookings && user.bookings.length > 0 ? (
            <div className="space-y-4">
              {user.bookings.map((booking: any) => (
                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-4 last:border-0 gap-2">
                  <div>
                    <p className="font-medium text-purple-800">{getMachineName(booking.machineId)}</p>
                    <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      booking.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'Canceled' || booking.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-purple-200 hover:bg-purple-50"
                        onClick={() => booking.status === 'Approved' ? handleCancelBooking(booking) : handleViewBookingDetails(booking)}
                      >
                        {booking.status === 'Approved' ? 'Cancel' : 'View'}
                      </Button>
                      
                      {/* Delete button for all bookings regardless of status */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-200 hover:bg-red-50 text-red-700"
                        onClick={() => handleDeleteBooking(booking)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>You don't have any bookings yet.</p>
              <Button 
                className="mt-2 bg-purple-600 hover:bg-purple-700" 
                onClick={handleBookMachine}
              >
                Book a Machine
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Information about your booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Date and Time</p>
                  <p className="text-sm text-gray-600">{selectedBooking.date} at {selectedBooking.time}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Machine Details</p>
                  <p className="text-sm text-gray-600">
                    {getMachineName(selectedBooking.machineId)} - {getMachineType(selectedBooking.machineId)}
                  </p>
                </div>
              </div>
              
              <div className="p-3 rounded-md bg-gray-50 border">
                <p className="font-medium mb-1">Status: <span className={`
                  ${selectedBooking.status === 'Approved' && 'text-green-600'} 
                  ${selectedBooking.status === 'Pending' && 'text-yellow-600'}
                  ${(selectedBooking.status === 'Rejected' || selectedBooking.status === 'Canceled') && 'text-red-600'}
                `}>{selectedBooking.status}</span></p>
                {selectedBooking.status === 'Pending' && (
                  <p className="text-sm text-gray-600">Your booking is waiting for admin approval. You will be notified once it's approved.</p>
                )}
                {selectedBooking.status === 'Rejected' && (
                  <p className="text-sm text-gray-600">Your booking was rejected. Please contact an administrator for more information.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {bookingToDelete && (
            <div className="py-4">
              <p className="text-sm font-semibold">{getMachineName(bookingToDelete.machineId)}</p>
              <p className="text-sm text-gray-500">{bookingToDelete.date} at {bookingToDelete.time}</p>
              <p className="text-sm text-gray-500">Status: <span className={`
                ${bookingToDelete.status === 'Approved' && 'text-green-600'} 
                ${bookingToDelete.status === 'Pending' && 'text-yellow-600'}
                ${(bookingToDelete.status === 'Rejected' || bookingToDelete.status === 'Canceled') && 'text-red-600'}
              `}>{bookingToDelete.status}</span></p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteBooking}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingsCard;
