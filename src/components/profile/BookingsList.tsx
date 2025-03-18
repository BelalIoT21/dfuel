
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const BookingsList = ({ bookings, getMachineName, onViewDetails, onDeleteBooking }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No bookings to display</p>
      </div>
    );
  }

  const getBookingMachineId = (booking) => {
    if (booking.machineId) return booking.machineId;
    if (booking.machine && typeof booking.machine === 'object') return booking.machine._id;
    return booking.machine;
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      
      // Check if the date is already a string in YYYY-MM-DD format
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Parse the date string to a Date object
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      
      // Format the date as YYYY-MM-DD
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id || booking._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-4 last:border-0 gap-2">
          <div>
            <p className="font-medium text-purple-800">
              {booking.machineName || getMachineName(getBookingMachineId(booking))}
            </p>
            <p className="text-sm text-gray-500">{formatDate(booking.date)} at {booking.time}</p>
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
                onClick={() => onViewDetails(booking)}
              >
                <Info size={16} className="mr-1" />
                View
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-200 hover:bg-red-50 text-red-700"
                onClick={() => onDeleteBooking(booking)}
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingsList;
