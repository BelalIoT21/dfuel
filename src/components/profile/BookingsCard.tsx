
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { machines } from '../../utils/data';
import { Mail, Calendar, Info, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { machineService } from '@/services/machineService';
import { bookingService } from '@/services/bookingService';
import mongoDbService from '@/services/mongoDbService';
import BookingsList from './BookingsList';
import EmptyBookingsView from './EmptyBookingsView';

const BookingsCard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [machineNames, setMachineNames] = useState({});
  const { toast } = useToast();
  
  const fetchMachineNames = async () => {
    const names = {};
    if (user?.bookings && user.bookings.length > 0) {
      for (const booking of user.bookings) {
        try {
          // Try to get the name from the machines array first (avoid API calls)
          const machineFromData = machines.find(m => m.id === booking.machineId);
          if (machineFromData) {
            names[booking.machineId] = machineFromData.name;
          } else {
            // Fallback to API if not found in static data
            const machine = await machineService.getMachineById(booking.machineId);
            if (machine) {
              names[booking.machineId] = machine.name;
            }
          }
        } catch (error) {
          console.error(`Error fetching machine ${booking.machineId}:`, error);
          // Fallback to a default name if api call fails
          names[booking.machineId] = getMachineName(booking.machineId);
        }
      }
    }
    setMachineNames(names);
  };
  
  useEffect(() => {
    if (user) {
      fetchMachineNames();
    }
  }, [user]);
  
  if (!user) return null;

  const handleBookMachine = () => {
    // Direct update of search params for better tab switching
    setSearchParams({ tab: 'certifications' });
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleDeleteBooking = (booking) => {
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
      }
      
      // Update user state to remove the booking
      if (user.bookings) {
        const updatedBookings = user.bookings.filter(b => b.id !== bookingToDelete.id);
        // Update local storage 
        const updatedUser = {...user, bookings: updatedBookings};
        localStorage.setItem('learnit_user', JSON.stringify(updatedUser));
        
        // Force a page refresh to update the UI
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      
      // Even if an error occurs, still remove from UI
      if (user.bookings) {
        const updatedBookings = user.bookings.filter(b => b.id !== bookingToDelete.id);
        // Update local storage
        const updatedUser = {...user, bookings: updatedBookings};
        localStorage.setItem('learnit_user', JSON.stringify(updatedUser));
        
        toast({
          title: "Booking Removed",
          description: "The booking has been removed from your profile.",
        });
        
        // Force a page refresh to update the UI
        window.location.reload();
      }
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleRefreshBookings = () => {
    setIsRefreshing(true);
    // Force a page refresh to update the UI
    window.location.reload();
  };

  const getMachineName = (machineId) => {
    // First try to use the pre-fetched machine names
    if (machineNames[machineId]) {
      return machineNames[machineId];
    }
    
    // Fall back to map if needed
    const machineMap = {
      '1': 'Laser Cutter',
      '2': 'Ultimaker',
      '4': 'X1 E Carbon 3D Printer',
      '5': 'Bambu Lab X1 E',
      '6': 'Soldering Station'
    };
    
    return machineMap[machineId] || `Machine ${machineId}`;
  };

  const getMachineType = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.type : "Unknown";
  };

  return (
    <>
      <Card className="border-purple-100">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" />
              Your Bookings
            </CardTitle>
            <CardDescription>Recent and upcoming machine reservations</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshBookings}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {user.bookings && user.bookings.length > 0 ? (
            <BookingsList 
              bookings={user.bookings}
              getMachineName={getMachineName}
              onViewDetails={handleViewBookingDetails}
              onDeleteBooking={handleDeleteBooking}
            />
          ) : (
            <EmptyBookingsView onBookMachine={handleBookMachine} />
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
