
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Info, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { machineService } from '@/services/machineService';
import BookingDetailsDialog from './BookingDetailsDialog';
import { bookingDatabaseService } from '@/services/database/bookingService';
import { useToast } from '@/hooks/use-toast';

const BookingsList = ({ bookings, getMachineName, onViewDetails, onDeleteBooking }) => {
  const [machineStatuses, setMachineStatuses] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingDelete, setProcessingDelete] = useState(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch machine statuses for all machines in the bookings
    const fetchMachineStatuses = async () => {
      if (!bookings || bookings.length === 0) return;
      
      const statuses = {};
      for (const booking of bookings) {
        const machineId = getBookingMachineId(booking);
        if (machineId && !statuses[machineId] && typeof machineId === 'string') {
          try {
            const status = await machineService.getMachineStatus(machineId);
            statuses[machineId] = status;
          } catch (error) {
            console.error(`Error fetching status for machine ${machineId}:`, error);
            statuses[machineId] = 'unknown';
          }
        }
      }
      setMachineStatuses(statuses);
    };
    
    fetchMachineStatuses();
  }, [bookings]);

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
      
      // Handle ISO strings with timezone indicator
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = parseISO(dateString);
        return format(date, 'yyyy-MM-dd');
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
  
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected':
      case 'canceled':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return null;
    }
  };
  
  const getMachineStatusIndicator = (machineId) => {
    const status = machineStatuses[machineId] || 'unknown';
    
    let bgColor, textColor;
    switch (status) {
      case 'available':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'maintenance':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'in-use':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`text-xs px-2 py-1 rounded capitalize ${bgColor} ${textColor}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleDeleteBooking = async (booking) => {
    try {
      const bookingId = booking.id || booking._id;
      
      if (!bookingId) {
        toast({
          title: "Error",
          description: "Booking ID is missing",
          variant: "destructive"
        });
        return;
      }

      setProcessingDelete(bookingId);
      
      // First try database service
      const success = await bookingDatabaseService.deleteBooking(bookingId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Booking deleted successfully"
        });
        // Call the parent component's callback to update state
        if (onDeleteBooking) {
          onDeleteBooking(booking);
        } else {
          // If no callback was provided, at least update local UI
          // This prevents the deleted booking from reappearing
          // until the parent component refreshes the list
          const deleteBookingDelay = setTimeout(() => {
            setProcessingDelete(null);
          }, 1000);
          return () => clearTimeout(deleteBookingDelay);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete booking",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setProcessingDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const machineId = getBookingMachineId(booking);
        const bookingId = booking.id || booking._id;
        const isProcessing = processingDelete === bookingId;
        
        // Skip rendering bookings that are being processed for deletion
        if (isProcessing && !onDeleteBooking) {
          return null;
        }
        
        return (
          <div key={bookingId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-4 last:border-0 gap-2">
            <div>
              <p className="font-medium text-purple-800">
                {booking.machineName || getMachineName(machineId)}
              </p>
              <p className="text-sm text-gray-500">{formatDate(booking.date)} at {booking.time}</p>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                  booking.status === 'Approved' 
                    ? 'bg-green-100 text-green-800' 
                    : booking.status === 'Canceled' || booking.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStatusIcon(booking.status)}
                  {booking.status}
                </span>
                
                {/* Machine current status */}
                {machineId && machineStatuses[machineId] && (
                  <div className="text-xs">
                    Machine: {getMachineStatusIndicator(machineId)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-purple-200 hover:bg-purple-50"
                  onClick={() => handleViewBooking(booking)}
                >
                  <Info size={16} className="mr-1" />
                  View Booking
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-red-200 hover:bg-red-50 text-red-700"
                  onClick={() => handleDeleteBooking(booking)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <Clock size={16} className="mr-1 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        booking={selectedBooking}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onCancel={onDeleteBooking}
        canCancel={true}
      />
    </div>
  );
};

export default BookingsList;
