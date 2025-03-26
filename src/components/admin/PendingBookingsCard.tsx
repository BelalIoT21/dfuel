
import { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calendar, Loader2, Trash } from "lucide-react";
import { bookingService } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';
import mongoDbService from '@/services/mongoDbService';
import { format } from 'date-fns';

interface PendingBookingsCardProps {
  pendingBookings?: any[];
  onBookingStatusChange?: () => void;
}

export const PendingBookingsCard = ({ 
  pendingBookings = [],
  onBookingStatusChange
}: PendingBookingsCardProps) => {
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleBookingAction = useCallback(async (bookingId: string, action: 'Approved' | 'Rejected' | 'Deleted') => {
    if (!bookingId) {
      toast({
        title: "Error",
        description: "Invalid booking ID",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingBookingId(bookingId);
    
    try {
      console.log(`BookingService action: bookingId=${bookingId}, action=${action}`);
      
      if (action === 'Deleted') {
        // Try MongoDB deletion first
        let success = false;
        
        try {
          console.log("Attempting to delete booking via MongoDB:", bookingId);
          success = await mongoDbService.deleteBooking(bookingId);
          console.log(`MongoDB deleteBooking result for ID ${bookingId}: ${success}`);
        } catch (mongoError) {
          console.error("MongoDB booking deletion error:", mongoError);
        }
        
        // If MongoDB fails, try the booking service
        if (!success) {
          try {
            console.log("MongoDB deletion failed, trying bookingService for ID:", bookingId);
            success = await bookingService.deleteBooking(bookingId);
            console.log(`BookingService deleteBooking result: ${success}`);
          } catch (serviceError) {
            console.error("BookingService error deleting booking:", serviceError);
          }
        }
        
        // Force refresh the bookings list regardless of success status
        if (onBookingStatusChange) {
          onBookingStatusChange();
        }
        
        if (success) {
          toast({
            title: "Booking Removed",
            description: "The booking has been removed from the system."
          });
        } else {
          toast({
            title: "Delete Failed",
            description: "Could not remove the booking. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // Handle approval/rejection
        console.log(`Updating booking status: ID=${bookingId}, new status=${action}`);
        
        // Try MongoDB directly first
        let success = false;
        
        try {
          success = await mongoDbService.updateBookingStatus(bookingId, action);
          console.log(`MongoDB updateBookingStatus result: ${success}`);
        } catch (mongoError) {
          console.error("MongoDB error updating booking status:", mongoError);
        }
        
        // If MongoDB fails, try the booking service
        if (!success) {
          try {
            success = await bookingService.updateBookingStatus(bookingId, action);
            console.log(`BookingService updateBookingStatus result: ${success}`);
          } catch (serviceError) {
            console.error("BookingService error updating status:", serviceError);
          }
        }
        
        // Force refresh the bookings list regardless of success status
        if (onBookingStatusChange) {
          onBookingStatusChange();
        }
        
        if (success) {
          toast({
            title: `Booking ${action}`,
            description: `The booking has been ${action.toLowerCase()} successfully.`
          });
        } else {
          toast({
            title: "Action Failed",
            description: `Could not ${action.toLowerCase()} booking. Please try again.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error(`Error processing booking action:`, error);
      
      toast({
        title: "Error",
        description: "An error occurred while processing the booking",
        variant: "destructive"
      });
    } finally {
      setProcessingBookingId(null);
    }
  }, [toast, onBookingStatusChange]);
  
  const formatBookingDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  if (pendingBookings.length === 0) {
    return (
      <Card className="border-purple-100">
        <CardContent className="p-4 text-center">
          <p className="text-gray-500">No pending bookings to approve</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-purple-100">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium">Pending Booking Requests</h3>
          </div>
          
          {pendingBookings.map((booking) => (
            <div key={booking.id || booking._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-4 last:border-0 gap-2">
              <div>
                <p className="font-medium text-purple-800">
                  {booking.machineName || `Machine ${booking.machineId || booking.machine}`}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.userName || 'User'} • {formatBookingDate(booking.date)} at {booking.time}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-200 hover:bg-green-50 text-green-700"
                  onClick={() => handleBookingAction(booking.id || booking._id, 'Approved')}
                  disabled={processingBookingId === (booking.id || booking._id)}
                >
                  {processingBookingId === (booking.id || booking._id) ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 hover:bg-red-50 text-red-700"
                  onClick={() => handleBookingAction(booking.id || booking._id, 'Rejected')}
                  disabled={processingBookingId === (booking.id || booking._id)}
                >
                  {processingBookingId === (booking.id || booking._id) ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 hover:bg-gray-50 text-gray-700"
                  onClick={() => handleBookingAction(booking.id || booking._id, 'Deleted')}
                  disabled={processingBookingId === (booking.id || booking._id)}
                >
                  {processingBookingId === (booking.id || booking._id) ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash className="h-4 w-4 mr-1" />}
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
