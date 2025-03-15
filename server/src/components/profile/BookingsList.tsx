
import React from 'react';
import { Button } from '../ui/button';
import { Trash2, Info } from 'lucide-react';

export interface Booking {
  id?: string;
  _id?: string;
  userId: string;
  machineId: string;
  date: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Canceled' | "Completed";
  machineName?: string;
}

interface BookingsListProps {
  bookings: Booking[];
  getMachineName: (id: string) => string;
  onViewDetails: (booking: Booking) => void;
  onDeleteBooking: (booking: Booking) => void;
}

const BookingsList = ({ bookings, getMachineName, onViewDetails, onDeleteBooking }: BookingsListProps) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No bookings to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id || booking._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-4 last:border-0 gap-2">
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
