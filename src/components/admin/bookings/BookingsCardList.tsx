
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from 'lucide-react';

interface BookingsCardListProps {
  bookings: any[];
  handleStatusChange: (bookingId: string, newStatus: string) => Promise<void>;
  filter: string;
  setFilter: (filter: string) => void;
}

export const BookingsCardList = ({ bookings, handleStatusChange, filter, setFilter }: BookingsCardListProps) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="mb-2">No bookings found matching the selected filter.</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => setFilter('all')}
        >
          View All Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking: any) => (
        <Card key={booking.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{booking.machineName}</CardTitle>
              <Badge variant={booking.status === 'Approved' ? 'default' : 'outline'} 
                   className={`
                     ${booking.status === 'Approved' && 'bg-green-500 hover:bg-green-600'} 
                     ${booking.status === 'Pending' && 'bg-yellow-500 hover:bg-yellow-600'} 
                     ${booking.status === 'Rejected' && 'bg-red-500 hover:bg-red-600'}
                   `}>
                {booking.status}
              </Badge>
            </div>
            <CardDescription>
              <span className="font-medium">User:</span> {booking.userName}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm mb-3">
              <span className="font-medium">Date & Time:</span> {booking.date} at {booking.time}
            </p>
            
            {booking.status === 'Pending' ? (
              <div className="flex flex-col gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600 flex items-center justify-center gap-1 w-full"
                  onClick={() => handleStatusChange(booking.id, 'Approved')}
                >
                  <CheckCircle size={16} />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="flex items-center justify-center gap-1 w-full"
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
                className="border-purple-200 w-full"
                onClick={() => console.log('View booking details', booking.id)}
              >
                View Details
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
