
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { machines } from '../../utils/data';
import { Mail, Info, Calendar, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const BookingsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  if (!user) return null;

  const handleBookMachine = () => {
    // Direct update of search params for better tab switching
    setSearchParams({ tab: 'certifications' });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      case 'Pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      case 'Canceled':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const handleCancel = (booking) => {
    toast({
      title: "Cancel Booking",
      description: "Booking cancellation functionality will be implemented soon.",
    });
  };

  const BookingDetailsDialog = ({ booking }) => {
    if (!booking) return null;
    
    const machine = machines.find(m => m.id === booking.machineId);
    
    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Information about your machine booking
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Machine</p>
              <p className="font-medium">{machine?.name || 'Unknown Machine'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="mt-1">{getStatusBadge(booking.status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4 text-purple-600" />
                <p>{booking.date}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <p>{booking.time}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-purple-50 rounded-md">
            <h4 className="text-sm font-medium text-purple-800 mb-1">Usage Instructions</h4>
            <ul className="text-sm text-purple-700 list-disc pl-5 space-y-1">
              <li>Arrive 10 minutes before your booking time</li>
              <li>Sign in at the front desk</li>
              <li>Follow all safety protocols</li>
              <li>Clean the machine after use</li>
              {booking.status === 'Pending' && (
                <li className="font-medium">Booking is pending approval from admin</li>
              )}
            </ul>
          </div>
          
          {booking.status === 'Approved' && (
            <div className="flex justify-end mt-4">
              <Button 
                variant="destructive"
                className="flex items-center gap-1"
                onClick={() => handleCancel(booking)}
              >
                <XCircle size={16} />
                Cancel Booking
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    );
  };

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail size={20} className="text-purple-600" />
          Your Bookings
        </CardTitle>
        <CardDescription>Recent and upcoming bookings</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {user.bookings && user.bookings.length > 0 ? (
          <div className="space-y-4">
            {user.bookings.map((booking: any) => {
              const machine = machines.find(m => m.id === booking.machineId);
              return (
                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-4 last:border-0 gap-2">
                  <div>
                    <p className="font-medium text-purple-800">{machine?.name}</p>
                    <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(booking.status)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-purple-200 hover:bg-purple-50 flex items-center gap-1"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Info className="h-4 w-4" />
                          View
                        </Button>
                      </DialogTrigger>
                      <BookingDetailsDialog booking={booking} />
                    </Dialog>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>You don't have any bookings yet.</p>
            <Button 
              className="mt-2 bg-purple-600 hover:bg-purple-700" 
              onClick={handleBookMachine}
            >
              Book a Machine
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsCard;
