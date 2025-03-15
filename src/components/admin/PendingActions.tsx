
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/apiService";
import { toast } from "@/components/ui/use-toast";

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending bookings
  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllBookings();
        if (response.data) {
          const filtered = response.data.filter(booking => booking.status === 'Pending');
          setPendingBookings(filtered);
        }
      } catch (error) {
        console.error('Error fetching pending bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      // Call API to update the booking status
      const response = await apiService.updateBookingStatus(bookingId, newStatus);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update the local state to remove the approved/rejected booking
      setPendingBookings(pendingBookings.filter((booking: any) => booking._id !== bookingId));
      
      toast({
        title: `Booking ${newStatus}`,
        description: `You have ${newStatus.toLowerCase()} the booking request`,
        variant: newStatus === 'Approved' ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error(`Error updating booking status:`, error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-purple-100">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <AlertTriangle className="h-5 w-5 text-purple-600" />
          Pending Actions
        </CardTitle>
        <CardDescription>Items that require your attention</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {loading ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Loading pending actions...</p>
          </div>
        ) : pendingBookings.length > 0 ? (
          <div className="space-y-4">
            {pendingBookings.map((booking: any) => (
              <div key={booking._id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{booking.machine?.name || 'Unknown Machine'}</p>
                    <p className="text-sm text-gray-500">
                      {booking.user?.name || 'Unknown User'} • {booking.date} at {booking.time}
                    </p>
                  </div>
                  <Badge className="bg-yellow-500">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    className="bg-green-500 hover:bg-green-600 flex items-center gap-1"
                    onClick={() => handleStatusChange(booking._id, 'Approved')}
                  >
                    <CheckCircle size={14} />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="flex items-center gap-1"
                    onClick={() => handleStatusChange(booking._id, 'Rejected')}
                  >
                    <XCircle size={14} />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No pending actions at this time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
