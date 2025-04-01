
import { useState, useEffect, useCallback, useRef } from 'react';
import { PendingBookingsCard } from "./PendingBookingsCard";
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const lastFetchedRef = useRef(0);
  const isFetchingRef = useRef(false);
  
  const fetchPendingBookings = useCallback(async () => {
    // Return early if we're already refreshing to prevent duplicate calls
    if (isFetchingRef.current) return;
    
    // Only fetch if it's been more than 120 seconds since the last fetch (increased from 60s)
    const now = Date.now();
    if (now - lastFetchedRef.current < 120000 && lastFetchedRef.current > 0) {
      console.log("PendingActions: Skipping fetch, last fetched less than 120 seconds ago");
      return;
    }
    
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      isFetchingRef.current = true;
      lastFetchedRef.current = now;
      
      console.log("Fetching pending bookings...");
      
      // Try direct API fetch
      console.log("Fetching bookings directly from API");
      const response = await apiService.request({
        method: 'GET',
        url: 'bookings/all'
      });
      
      console.log("API response for bookings:", response);
      if (response?.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} bookings via API`);
        // Filter to only show pending bookings
        const pendingOnly = response.data.filter(booking => 
          booking.status === 'Pending' || booking.status === 'pending'
        );
        console.log(`Found ${pendingOnly.length} pending bookings from API`);
        setPendingBookings(pendingOnly);
      } else {
        console.log("No bookings found or invalid response");
        setPendingBookings([]);
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setPendingBookings([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);
  
  useEffect(() => {
    // Initial fetch
    fetchPendingBookings();
    
    // Set up polling to refresh pending bookings at a lower frequency (2 minutes)
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing pending bookings");
      fetchPendingBookings();
    }, 120000); // 2 minutes
    
    return () => clearInterval(intervalId);
  }, [fetchPendingBookings]);

  // Handle booking status change to completely refresh the list
  const handleBookingStatusChange = useCallback(async () => {
    console.log("Booking status changed, refreshing list");
    // Force immediate refresh of the bookings list
    await fetchPendingBookings();
  }, [fetchPendingBookings]);

  const handleManualRefresh = () => {
    if (isRefreshing) return; // Prevent multiple clicks
    
    // Reset the last fetched time to force a refresh
    lastFetchedRef.current = 0;
    
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
        ) : pendingBookings.length > 0 ? (
          <PendingBookingsCard 
            pendingBookings={pendingBookings}
            onBookingStatusChange={handleBookingStatusChange}
          />
        ) : (
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <p className="text-gray-500">No pending bookings to approve</p>
          </div>
        )}
      </div>
    </div>
  );
};
