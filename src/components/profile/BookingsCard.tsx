
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/services/bookingService';
import { bookingDatabaseService } from '@/services/database/bookingService';
import { machineService } from '@/services/machineService';
import { useToast } from '@/hooks/use-toast';
import BookingsList from './BookingsList';

const BookingsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookingsAndMachines = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get bookings
        const userBookings = await bookingService.getUserBookings(user.id);
        console.log("User bookings in BookingsCard:", userBookings);
        
        // Get all machines to resolve machine names
        const allMachines = await machineService.getMachines();
        
        // Create a lookup object for machine names
        const machinesLookup = {};
        allMachines.forEach(machine => {
          const id = machine.id || machine._id;
          machinesLookup[id] = machine.name;
        });
        
        setMachines(machinesLookup);
        setBookings(userBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load bookings"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsAndMachines();
  }, [user, toast]);

  const getMachineName = (machineId) => {
    return machines[machineId] || "Unknown Machine";
  };

  const handleViewDetails = (booking) => {
    // We no longer need to navigate to a different page since we'll show a dialog
    // The dialog handling is now in BookingsList
    console.log("View booking details for:", booking);
  };

  const handleDeleteBooking = async (booking) => {
    try {
      const bookingId = booking.id || booking._id;
      
      if (!bookingId) {
        toast({
          title: "Error",
          description: "Booking ID is missing",
          variant: "destructive"
        });
        return;
      }
      
      const success = await bookingDatabaseService.deleteBooking(bookingId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Booking deleted successfully"
        });
        // Remove the booking from state
        setBookings(bookings.filter(b => (b.id || b._id) !== bookingId));
      } else {
        toast({
          title: "Error",
          description: "Failed to delete booking",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-purple-100">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} className="text-purple-600" />
            Machine Bookings
          </CardTitle>
          <CardDescription>Manage your machine booking appointments</CardDescription>
        </div>
        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/profile?tab=certifications')}
            className="text-purple-600 hover:bg-purple-50"
          >
            Browse Machines
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-600" />
              <p className="text-gray-500">Loading your bookings...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You don't have any active bookings</p>
            <Button 
              onClick={() => navigate('/profile?tab=certifications')}
              variant="default"
            >
              Browse Machines
            </Button>
          </div>
        ) : (
          <BookingsList 
            bookings={bookings} 
            getMachineName={getMachineName} 
            onViewDetails={handleViewDetails} 
            onDeleteBooking={handleDeleteBooking} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsCard;
