
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Clock, User } from "lucide-react";

interface RecentActivitiesProps {
  bookings: any[];
}

export const RecentActivities = ({ bookings = [] }: RecentActivitiesProps) => {
  // Helper function to format dates consistently
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get only the most recent 5 bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card className="col-span-1 lg:col-span-1 border-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-purple-600" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentBookings.length > 0 ? (
          <div className="space-y-4">
            {recentBookings.map((booking, index) => (
              <div key={booking._id || booking.id || index} className="flex items-start space-x-3 border-b pb-3 last:border-0">
                <div className="rounded-full bg-purple-100 p-2">
                  <CalendarClock className="h-4 w-4 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {booking.userName || 'Unknown user'} booked {booking.machineName || 'a machine'}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="mr-1 h-3 w-3" />
                    <span>{formatDate(booking.date || booking.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p className="text-sm">No recent bookings to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
