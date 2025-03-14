
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { machines } from '../../utils/data';
import { Mail } from 'lucide-react';

const BookingsCard = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const redirectPath = user.isAdmin ? '/admin' : '/dashboard';

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
                    <span className={`text-xs px-2 py-1 rounded ${
                      booking.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                    <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
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
            <Button className="mt-2 bg-purple-600 hover:bg-purple-700" asChild>
              <Link to="/profile?tab=certifications">Book a Machine</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsCard;
