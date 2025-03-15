
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PendingBookingsCard } from "./PendingBookingsCard";
import { bookingService } from '../../../../src/services/bookingService';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../../../src/hooks/use-toast';

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const fetchPendingBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching pending bookings for admin dashboard");
      
      // Use the bookingService to get all bookings
      const allBookings = await bookingService.getAllBookings();
      console.log(`Found ${allBookings.length} total bookings`);
      
      // Filter for pending bookings only
      const pendingOnly = allBookings.filter(booking => booking.status === 'Pending');
      console.log(`Found ${pendingOnly.length} pending bookings`);
      
      setPendingBookings(pendingOnly);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setPendingBookings([]);
      toast({
        title: "Error",
        description: "Failed to load pending bookings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchPendingBookings();
    
    // Set up polling to refresh pending bookings every 30 seconds
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing pending bookings");
      fetchPendingBookings();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchPendingBookings]);

  // Handle booking status change to completely refresh the list
  const handleBookingStatusChange = useCallback(async () => {
    console.log("Booking status changed, refreshing list");
    await fetchPendingBookings();
  }, [fetchPendingBookings]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchPendingBookings();
    toast({
      title: "Refreshing Bookings",
      description: "Fetching the latest booking information..."
    });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pending Actions</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-4 bg-white rounded-lg shadow flex flex-col items-center">
            <Loader2 className="h-6 w-6 text-purple-600 animate-spin mb-2" />
            <p>Loading pending bookings...</p>
          </div>
        ) : (
          <PendingBookingsCard 
            pendingBookings={pendingBookings}
            onBookingStatusChange={handleBookingStatusChange}
          />
        )}
      </div>
    </div>
  );
};
