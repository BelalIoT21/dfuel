
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/apiService";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { machines } from "@/utils/data";

export const PendingActions = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllBookings();
        if (response.data) {
          // Filter only pending bookings
          const pending = response.data.filter(
            (booking: any) => booking.status === 'Pending'
          );
          setPendingBookings(pending);
        }
      } catch (error) {
        console.error("Error fetching pending bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load pending bookings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBookings();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (bookingId: string) => {
    try {
      const response = await apiService.updateBookingStatus(bookingId, "Approved");
      if (response.data) {
        // Remove the booking from the list
        setPendingBookings(pendingBookings.filter((booking: any) => booking._id !== bookingId));
        toast({
          title: "Booking Approved",
          description: "The booking has been approved successfully",
        });
      }
    } catch (error) {
      console.error("Error approving booking:", error);
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      const response = await apiService.updateBookingStatus(bookingId, "Rejected");
      if (response.data) {
        // Remove the booking from the list
        setPendingBookings(pendingBookings.filter((booking: any) => booking._id !== bookingId));
        toast({
          title: "Booking Rejected",
          description: "The booking has been rejected",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast({
        title: "Error",
        description: "Failed to reject booking",
        variant: "destructive",
      });
    }
  };

  // Find machine name by ID
  const getMachineName = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : "Unknown Machine";
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
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">Loading pending actions...</p>
            </div>
          ) : pendingBookings.length > 0 ? (
            pendingBookings.map((booking: any) => (
              <div key={booking._id || booking.id} className="border rounded-md p-3 bg-white shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-purple-800">
                      {getMachineName(booking.machine || booking.machineId)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {booking.user?.name || "User"} - {booking.date} at {booking.time}
                    </p>
                    <Badge className="mt-1 bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <Button 
                      onClick={() => handleApprove(booking._id || booking.id)}
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600 flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleReject(booking._id || booking.id)}
                      size="sm" 
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No pending actions at this time.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
