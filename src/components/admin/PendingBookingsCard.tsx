
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, CalendarClock } from 'lucide-react';
import { bookingService } from '@/services/bookingService';
import { formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function PendingBookingsCard({ pendingBookings, onBookingStatusChange }) {
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({});

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      setProcessing(prev => ({ ...prev, [bookingId]: true }));
      console.log(`Updating booking ${bookingId} to ${status}`);
      
      const success = await bookingService.updateBookingStatus(bookingId, status);
      
      if (success) {
        toast({
          title: "Status Updated",
          description: `The booking has been ${status.toLowerCase()}.`,
        });
        
        // Trigger parent refresh
        if (onBookingStatusChange) {
          onBookingStatusChange();
        }
      } else {
        toast({
          title: "Update Failed",
          description: "There was a problem updating the booking status.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Error updating booking status:`, error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating the booking status.",
        variant: "destructive"
      });
    } finally {
      setProcessing(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Format the date for display
  const getFormattedDate = (dateString: string) => {
    try {
      return formatDate(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {pendingBookings.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No pending bookings found.
        </div>
      ) : (
        pendingBookings.map((booking) => (
          <div
            key={booking._id || booking.id}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <h3 className="font-medium text-gray-900">
                  {booking.userName || 'User'} • {booking.machineName || `Machine ${booking.machineId}`}
                </h3>
                <div className="mt-1 text-sm text-gray-500 flex flex-wrap items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                  <span>
                    {getFormattedDate(booking.date)} at {booking.time}
                  </span>
                  {booking.status && (
                    <Badge 
                      variant="outline"
                      className="ml-2 capitalize text-xs bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {booking.status}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => handleUpdateStatus(booking._id || booking.id, 'Approved')}
                  disabled={processing[booking._id || booking.id]}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => handleUpdateStatus(booking._id || booking.id, 'Rejected')}
                  disabled={processing[booking._id || booking.id]}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
