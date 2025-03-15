
import { useState, useEffect, useCallback } from 'react';
import { PendingBookingsCard } from "./PendingBookingsCard";
import { bookingService } from '@/services/bookingService';
import { Loader2, Trash2 } from 'lucide-react';
import mongoDbService from '@/services/mongoDbService';
import { Button } from '../ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  
  const fetchPendingBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try MongoDB first for direct database access
      let allBookings = [];
      try {
        console.log("Fetching bookings directly from MongoDB");
        allBookings = await mongoDbService.getAllBookings();
        console.log(`Found ${allBookings.length} bookings in MongoDB`);
      } catch (mongoError) {
        console.error("MongoDB booking fetch error:", mongoError);
      }
      
      // If MongoDB fails or returns empty, use the service
      if (!allBookings || allBookings.length === 0) {
        console.log("Falling back to bookingService");
        allBookings = await bookingService.getAllBookings();
        console.log(`Found ${allBookings.length} total bookings via bookingService`);
      }
      
      const pendingOnly = allBookings.filter(booking => booking.status === 'Pending');
      console.log(`Found ${pendingOnly.length} pending bookings`);
      
      setPendingBookings(pendingOnly);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setPendingBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPendingBookings();
    
    // Set up polling to refresh pending bookings every 10 seconds
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing pending bookings");
      fetchPendingBookings();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [fetchPendingBookings]);

  // Handle booking status change to completely refresh the list
  const handleBookingStatusChange = useCallback(async () => {
    console.log("Booking status changed, refreshing list");
    // Force immediate refresh of the bookings list
    await fetchPendingBookings();
  }, [fetchPendingBookings]);

  // Handle clearing all bookings
  const handleClearAllBookings = async () => {
    setIsClearing(true);
    try {
      const success = await bookingService.clearAllBookings();
      if (success) {
        console.log("All bookings cleared successfully");
        fetchPendingBookings(); // Refresh the list
      } else {
        console.log("No bookings were cleared or operation failed");
      }
    } catch (error) {
      console.error("Error clearing all bookings:", error);
      toast({
        title: "Error",
        description: "Failed to clear all bookings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pending Actions</h2>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Reset All Bookings
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Bookings</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete ALL bookings in the system for ALL users. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleClearAllBookings}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-1"
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isClearing ? "Clearing..." : "Reset All Bookings"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-4 bg-white rounded-lg shadow flex flex-col items-center">
            <Loader2 className="h-6 w-6 text-purple-600 animate-spin mb-2" />
            <p>Loading pending bookings...</p>
          </div>
        ) : pendingBookings.length > 0 ? (
          <PendingBookingsCard 
            pendingBookings={pendingBookings}
            onBookingStatusChange={handleBookingStatusChange}
          />
        ) : (
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <p className="text-gray-500">No pending bookings to approve</p>
          </div>
        )}
      </div>
    </div>
  );
};
