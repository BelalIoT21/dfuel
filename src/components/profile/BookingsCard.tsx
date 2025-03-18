
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
import { format, parseISO } from 'date-fns';

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
  const [bookings, setBookings] = useState([]);
  const { toast } = useToast();
  
  // Fetch bookings when component mounts or user changes
  useEffect(() => {
    const loadBookings = async () => {
      if (user && user.id) {
        try {
          console.log("Loading bookings for user:", user.id);
          setIsRefreshing(true);
          const userBookings = await bookingService.getUserBookings(user.id);
          console.log("Retrieved bookings from service:", userBookings);
          setBookings(userBookings || []);
        } catch (error) {
          console.error("Error loading bookings:", error);
          loadBookingsFromStorage();
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    
    const loadBookingsFromStorage = () => {
      const storedUser = localStorage.getItem('learnit_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const userBookings = parsedUser.bookings || [];
          console.log("User bookings loaded from localStorage:", userBookings);
          setBookings(userBookings);
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
          setBookings([]);
        }
      } else {
        setBookings([]);
      }
    };
    
    loadBookings();
  }, [user]);
  
  const fetchMachineNames = async () => {
    const names = {};
    if (bookings && bookings.length > 0) {
      for (const booking of bookings) {
        try {
          if (booking.machineName) {
            names[booking.machineId || booking.machine] = booking.machineName;
            continue;
          }
          
          if (booking.machine && booking.machine.name) {
            names[booking.machineId || booking.machine._id] = booking.machine.name;
            continue;
          }
          
          const machineId = booking.machineId || 
                           (booking.machine && typeof booking.machine === 'object' ? 
                            booking.machine._id : booking.machine);
          
          if (!machineId) {
            console.log("No valid machine ID found for booking:", booking);
            continue;
          }
          
          const machineFromData = machines.find(m => m.id === machineId);
          if (machineFromData) {
            names[machineId] = machineFromData.name;
          } else {
            const machine = await machineService.getMachineById(machineId);
            if (machine) {
              names[machineId] = machine.name;
            }
          }
        } catch (error) {
          console.error(`Error fetching machine for booking:`, error);
          names[booking.machineId || booking.machine] = getMachineName(booking.machineId || booking.machine);
        }
      }
    }
    setMachineNames(names);
  };
  
  useEffect(() => {
    if (bookings.length > 0) {
      fetchMachineNames();
    }
  }, [bookings]);
  
  if (!user) return null;

  const handleBookMachine = () => {
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
      console.log("Attempting to delete booking:", bookingToDelete.id || bookingToDelete._id);
      
      let success = false;
      let errorMessage = '';
      
      // First try MongoDB service
      try {
        success = await mongoDbService.deleteBooking(bookingToDelete.id || bookingToDelete._id);
        console.log(`MongoDB deleteBooking result: ${success}`);
      } catch (mongoError) {
        console.error("MongoDB delete booking error:", mongoError);
        errorMessage = mongoError.message || 'MongoDB deletion failed';
      }
      
      // If MongoDB fails, try booking service API
      if (!success) {
        try {
          success = await bookingService.deleteBooking(bookingToDelete.id || bookingToDelete._id);
          console.log(`BookingService deleteBooking result: ${success}`);
        } catch (bookingError) {
          console.error("BookingService delete error:", bookingError);
          errorMessage = errorMessage || bookingError.message || 'API deletion failed';
        }
      }
      
      // Update UI and local state regardless of deletion success
      const updatedBookings = bookings.filter(b => 
        (b.id || b._id) !== (bookingToDelete.id || bookingToDelete._id)
      );
      setBookings(updatedBookings);
      
      // Update local storage to maintain UI consistency
      const storedUser = localStorage.getItem('learnit_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.bookings = updatedBookings;
          localStorage.setItem('learnit_user', JSON.stringify(parsedUser));
        } catch (e) {
          console.error("Error updating localStorage after deletion:", e);
        }
      }
      
      // Show appropriate toast
      if (success) {
        toast({
          title: "Booking Deleted",
          description: "Your booking has been deleted successfully."
        });
      } else {
        toast({
          title: "Booking Removed",
          description: "The booking has been removed from your profile." + 
                      (errorMessage ? " Server reported: " + errorMessage : ""),
        });
        
        // Schedule a refresh to get the latest state from server
        setTimeout(() => handleRefreshBookings(), 1000);
      }
    } catch (error) {
      console.error("Error in confirmDeleteBooking:", error);
      
      toast({
        title: "Error",
        description: "There was an issue deleting your booking. Please refresh and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };

  const handleRefreshBookings = async () => {
    setIsRefreshing(true);
    
    try {
      if (user && user.id) {
        console.log("Refreshing bookings for user:", user.id);
        const userBookings = await bookingService.getUserBookings(user.id);
        console.log("Refreshed bookings from service:", userBookings);
        setBookings(userBookings || []);
        
        toast({
          title: "Bookings Refreshed",
          description: `Found ${userBookings.length} bookings.`,
        });
      }
    } catch (error) {
      console.error("Error refreshing bookings:", error);
      
      const storedUser = localStorage.getItem('learnit_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const refreshedBookings = parsedUser.bookings || [];
          setBookings(refreshedBookings);
          
          toast({
            title: "Bookings Refreshed (Local)",
            description: `Found ${refreshedBookings.length} bookings.`,
          });
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
          setBookings([]);
        }
      } else {
        setBookings([]);
      }
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const getMachineName = (machineId) => {
    if (machineNames[machineId]) {
      return machineNames[machineId];
    }
    
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
    const foundBooking = bookings.find(b => 
      (b.machineId === machineId || b.machine === machineId || 
      (b.machine && b.machine._id === machineId))
    );
    
    if (foundBooking && foundBooking.machine && foundBooking.machine.type) {
      return foundBooking.machine.type;
    }
    
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.type : "Unknown";
  };

  const formatBookingDate = (dateString) => {
    try {
      if (!dateString) return '';
      
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = parseISO(dateString);
        return format(date, 'yyyy-MM-dd');
      }
      
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <>
      <Card className="border-purple-100">
        <CardHeader className="flex flex-col pb-2">
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-purple-600 flex-shrink-0" />
              <div>
                <CardTitle className="text-xl sm:text-2xl">Your Bookings</CardTitle>
                <CardDescription className="text-sm mt-1">Recent and upcoming machine reservations</CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshBookings}
              disabled={isRefreshing}
              className="flex items-center gap-1 flex-shrink-0 ml-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {bookings && bookings.length > 0 ? (
            <BookingsList 
              bookings={bookings}
              getMachineName={getMachineName}
              onViewDetails={handleViewBookingDetails}
              onDeleteBooking={handleDeleteBooking}
            />
          ) : (
            <EmptyBookingsView onBookMachine={handleBookMachine} />
          )}
        </CardContent>
      </Card>

      {/* Booking details dialog */}
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
                    {getMachineName(selectedBooking.machineId || 
                                   (selectedBooking.machine && typeof selectedBooking.machine === 'object' ? 
                                    selectedBooking.machine._id : selectedBooking.machine))} 
                    {getMachineType(selectedBooking.machineId || 
                                  (selectedBooking.machine && typeof selectedBooking.machine === 'object' ? 
                                   selectedBooking.machine._id : selectedBooking.machine)) !== "Unknown" && 
                      ` - ${getMachineType(selectedBooking.machineId || 
                                         (selectedBooking.machine && typeof selectedBooking.machine === 'object' ? 
                                          selectedBooking.machine._id : selectedBooking.machine))}`}
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

      {/* Delete confirmation dialog */}
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
              <p className="text-sm font-semibold">{getMachineName(bookingToDelete.machineId || 
                                                               (bookingToDelete.machine && typeof bookingToDelete.machine === 'object' ? 
                                                                bookingToDelete.machine._id : bookingToDelete.machine))}</p>
              <p className="text-sm text-gray-500">{formatBookingDate(bookingToDelete.date)} at {bookingToDelete.time}</p>
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
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : "Delete Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingsCard;
