
import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const ActiveBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

  // Example bookings data - would come from API in production
  const bookings = [
    { 
      id: "1", 
      machineId: "1", 
      machineName: "3D Printer", 
      userId: "2", 
      userName: "Jane Smith", 
      date: "2023-06-15", 
      time: "10:00 AM", 
      status: "Approved" 
    },
    { 
      id: "2", 
      machineId: "3", 
      machineName: "CNC Router", 
      userId: "3", 
      userName: "Michael Johnson", 
      date: "2023-06-16", 
      time: "2:00 PM", 
      status: "Pending" 
    },
    { 
      id: "3", 
      machineId: "2", 
      machineName: "Laser Cutter", 
      userId: "4", 
      userName: "Emily Davis", 
      date: "2023-06-17", 
      time: "9:30 AM", 
      status: "Approved" 
    },
    { 
      id: "4", 
      machineId: "5", 
      machineName: "Wood Planer", 
      userId: "5", 
      userName: "Robert Wilson", 
      date: "2023-06-18", 
      time: "1:00 PM", 
      status: "Pending" 
    },
  ];

  // Filter bookings based on selected filter
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status.toLowerCase() === filter);

  // Handle approval or rejection
  const handleStatusChange = (bookingId: string, newStatus: string) => {
    // In a real app, call API to update the booking status
    console.log(`Booking ${bookingId} changed to ${newStatus}`);
    
    toast({
      title: `Booking ${newStatus}`,
      description: `You have ${newStatus.toLowerCase()} booking #${bookingId}`,
      variant: newStatus === 'Approved' ? 'default' : 'destructive',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader pageTitle="Booking Management" />
        
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Active Bookings</CardTitle>
              <CardDescription>Manage machine booking requests and reservations</CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredBookings.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Machine</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.machineName}</TableCell>
                        <TableCell>{booking.userName}</TableCell>
                        <TableCell>
                          {booking.date} at {booking.time}
                        </TableCell>
                        <TableCell>
                          <Badge variant={booking.status === 'Approved' ? 'default' : 'outline'} 
                                className={`
                                  ${booking.status === 'Approved' && 'bg-green-500 hover:bg-green-600'} 
                                  ${booking.status === 'Pending' && 'bg-yellow-500 hover:bg-yellow-600'} 
                                  ${booking.status === 'Rejected' && 'bg-red-500 hover:bg-red-600'}
                                `}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.status === 'Pending' ? (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600 flex items-center gap-1"
                                onClick={() => handleStatusChange(booking.id, 'Approved')}
                              >
                                <CheckCircle size={16} />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="flex items-center gap-1"
                                onClick={() => handleStatusChange(booking.id, 'Rejected')}
                              >
                                <XCircle size={16} />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" className="border-purple-200">
                              View Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p className="mb-2">No bookings found matching the selected filter.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setFilter('all')}
                >
                  View All Bookings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveBookings;
