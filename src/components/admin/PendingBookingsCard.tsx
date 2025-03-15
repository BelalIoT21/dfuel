
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calendar, Loader2, Trash } from "lucide-react";
import { bookingService } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';
import mongoDbService from '@/services/mongoDbService';

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
  
  // Handle booking approval, rejection, or deletion
  const handleBookingAction = async (bookingId: string, action: 'Approved' | 'Rejected' | 'Deleted') => {
    if (!bookingId) {
      toast({
        title: "Error",
        description: "Booking ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingBookingId(bookingId);
    
    try {
      console.log(`BookingService action: bookingId=${bookingId}, action=${action}`);
      
      let success = false;
      
      if (action === 'Deleted') {
        // Delete booking
        success = await bookingService.deleteBooking(bookingId);
        console.log(`BookingService deleteBooking result: ${success}`);
      } else {
        // Handle approval/rejection
        success = await bookingService.updateBookingStatus(bookingId, action);
        console.log(`BookingService updateBookingStatus result: ${success}`);
      }
      
      if (success) {
        toast({
          title: `Booking ${action}`,
          description: `The booking has been ${action.toLowerCase()} successfully.`
        });
        
        // After action, trigger refresh of the bookings list
        if (onBookingStatusChange) {
          onBookingStatusChange();
        }
      } else {
        toast({
          title: "Action Failed",
          description: `Could not ${action.toLowerCase()} booking. Please try again.`,
          variant: "destructive"
        });
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
          
          {pendingBookings.map((booking) => {
            const bookingId = booking.id || booking._id;
            const isProcessing = processingBookingId === bookingId;
            
            // Determine machine name with special handling for known IDs
            let machineName = booking.machineName || `Machine ${booking.machineId}`;
            let machineId = booking.machineId;
            
            // Handle cases where machineId is an object
            if (booking.machineId && typeof booking.machineId === 'object') {
              machineId = booking.machineId._id || booking.machineId.id;
            }
            
            if (machineId === "1" || machineId === 1 || machineId === "67d5658be9267b302f7aa015") {
              machineName = "Laser Cutter";
            } else if (machineId === "2" || machineId === 2 || machineId === "67d5658be9267b302f7aa016") {
              machineName = "Ultimaker";
            } else if (machineId === "4" || machineId === 4 || machineId === "67d5658be9267b302f7aa017") {
              machineName = "X1 E Carbon 3D Printer";
            } else if (machineId === "5" || machineId === 5 || machineId === "67d5658be9267b302f7aa018") {
              machineName = "Bambu Lab X1 E";
            } else if (machineId === "6" || machineId === 6 || machineId === "67d5658be9267b302f7aa019") {
              machineName = "Machine Safety Course";
            }
            
            // Get user name from booking
            const userName = booking.userName || (booking.user && booking.user.name) || "Unknown User";
            
            return (
              <div key={bookingId} className="border rounded-lg p-3 bg-white space-y-2">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{machineName}</h4>
                    <p className="text-xs text-gray-500">{userName}</p>
                  </div>
                  <div className="text-xs text-right">
                    <p className="font-medium">{booking.date}</p>
                    <p className="text-gray-500">{booking.time}</p>
                  </div>
                </div>
                
                <div className="flex justify-between space-x-2 pt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 flex-1"
                    onClick={() => handleBookingAction(bookingId, 'Approved')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Approve
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex-1"
                    onClick={() => handleBookingAction(bookingId, 'Rejected')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                    Reject
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                    onClick={() => handleBookingAction(bookingId, 'Deleted')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
