
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from 'lucide-react';

interface BookingsListProps {
  bookings: any[];
  handleStatusChange: (bookingId: string, newStatus: string) => Promise<void>;
  filter: string;
  setFilter: (filter: string) => void;
}

export const BookingsList = ({ bookings, handleStatusChange, filter, setFilter }: BookingsListProps) => {
  if (bookings.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
          <p className="mb-2">No bookings found matching the selected filter.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => setFilter('all')}
          >
            View All Bookings
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {bookings.map((booking: any) => (
        <TableRow key={booking.id}>
          <TableCell className="font-medium">{booking.machineName}</TableCell>
          <TableCell>{booking.userName}</TableCell>
          <TableCell>
            {booking.date} at {booking.time}
          </TableCell>
          <TableCell>
            <Badge variant={booking.status === 'Approved' ? 'default' : 'outline'} 
                 className={`
                   ${booking.status === 'Approved' && 'bg-green-500 hover:bg-green-600'} 
                   ${booking.status === 'Pending' && 'bg-yellow-500 hover:bg-yellow-600'} 
                   ${booking.status === 'Rejected' && 'bg-red-500 hover:bg-red-600'}
                 `}>
              {booking.status}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            {booking.status === 'Pending' ? (
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600 flex items-center gap-1"
                  onClick={() => handleStatusChange(booking.id, 'Approved')}
                >
                  <CheckCircle size={16} />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="flex items-center gap-1"
                  onClick={() => handleStatusChange(booking.id, 'Rejected')}
                >
                  <XCircle size={16} />
                  Reject
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                className="border-purple-200"
                onClick={() => console.log('View booking details', booking.id)}
              >
                View Details
              </Button>
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
