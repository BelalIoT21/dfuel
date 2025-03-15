
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { machines } from '../../utils/data';
import { Mail, Calendar, Info } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const BookingsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  if (!user) return null;

  const handleBookMachine = () => {
    // Direct update of search params for better tab switching
    setSearchParams({ tab: 'certifications' });
  };

  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleCancelBooking = (booking: any) => {
    toast({
      title: "Cancel Booking",
      description: "Booking cancellation functionality will be implemented soon.",
    });
  };

  const getMachineName = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : "Unknown Machine";
  };

  const getMachineType = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.type : "Unknown";
  };

  return (
    <>
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
                      <span className={`text-xs px-2 py-1 rounded ${
                        booking.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'Canceled' || booking.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-purple-200 hover:bg-purple-50"
                        onClick={() => booking.status === 'Approved' ? handleCancelBooking(booking) : handleViewBookingDetails(booking)}
                      >
                        {booking.status === 'Approved' ? 'Cancel' : 'View'}
                      </Button>
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

      {/* Booking Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Information about your booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Date and Time</p>
                  <p className="text-sm text-gray-600">{selectedBooking.date} at {selectedBooking.time}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Machine Details</p>
                  <p className="text-sm text-gray-600">
                    {getMachineName(selectedBooking.machineId)} - {getMachineType(selectedBooking.machineId)}
                  </p>
                </div>
              </div>
              
              <div className="p-3 rounded-md bg-gray-50 border">
                <p className="font-medium mb-1">Status: <span className={`
                  ${selectedBooking.status === 'Approved' && 'text-green-600'} 
                  ${selectedBooking.status === 'Pending' && 'text-yellow-600'}
                  ${(selectedBooking.status === 'Rejected' || selectedBooking.status === 'Canceled') && 'text-red-600'}
                `}>{selectedBooking.status}</span></p>
                {selectedBooking.status === 'Pending' && (
                  <p className="text-sm text-gray-600">Your booking is waiting for admin approval. You will be notified once it's approved.</p>
                )}
                {selectedBooking.status === 'Rejected' && (
                  <p className="text-sm text-gray-600">Your booking was rejected. Please contact an administrator for more information.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingsCard;
