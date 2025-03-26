
import React from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Calendar, User, Tag } from 'lucide-react';

interface BookingDetailsDialogProps {
  booking: any;
  open: boolean;
  onClose: () => void;
  onCancel?: (booking: any) => void;
  canCancel?: boolean;
}

const BookingDetailsDialog = ({ 
  booking, 
  open, 
  onClose, 
  onCancel, 
  canCancel = false 
}: BookingDetailsDialogProps) => {
  if (!booking) return null;
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-800">Booking Details</DialogTitle>
          <DialogDescription>
            Information about your machine booking
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-purple-800 mb-1">{booking.machineName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(booking.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{booking.time}</p>
              </div>
            </div>
            
            {booking.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{booking.location || 'Lab Room'}</p>
                </div>
              </div>
            )}
            
            {booking.machineType && (
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Machine Type</p>
                  <p className="font-medium">{booking.machineType}</p>
                </div>
              </div>
            )}
            
            {booking.createdAt && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Booked On</p>
                  <p className="font-medium">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-6 gap-2">
          {canCancel && booking.status?.toLowerCase() !== 'canceled' && (
            <Button 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => onCancel && onCancel(booking)}
            >
              Cancel Booking
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
