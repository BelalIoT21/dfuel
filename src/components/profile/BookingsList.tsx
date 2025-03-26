
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Info, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { machineService } from '@/services/machineService';

const BookingsList = ({ bookings, getMachineName, onViewDetails, onDeleteBooking }) => {
  const [machineStatuses, setMachineStatuses] = useState({});
  
  useEffect(() => {
    // Fetch machine statuses for all machines in the bookings
    const fetchMachineStatuses = async () => {
      if (!bookings || bookings.length === 0) return;
      
      const statuses = {};
      for (const booking of bookings) {
        const machineId = getBookingMachineId(booking);
        if (machineId && !statuses[machineId]) {
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
    switch (status.toLowerCase()) {
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

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const machineId = getBookingMachineId(booking);
        
        return (
          <div key={booking.id || booking._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-4 last:border-0 gap-2">
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
                  onClick={() => onViewDetails(booking)}
                >
                  <Info size={16} className="mr-1" />
                  View Booking
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
        );
      })}
    </div>
  );
};

export default BookingsList;
