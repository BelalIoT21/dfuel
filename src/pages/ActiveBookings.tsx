
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, CalendarCell, CalendarGrid, CalendarHeadCell, CalendarHeader, CalendarHeadRow, CalendarRow } from "@/components/ui/calendar";
import { useToast } from '@/components/ui/use-toast';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import { useAuth } from '../context/AuthContext';
import { machines } from '../utils/data';
import userDatabase from '../services/userDatabase';

// Let's create a separate component for the booking filters
const BookingFilters = ({ searchTerm, setSearchTerm, selectedDate, setSelectedDate }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border rounded-md p-3"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Create a component for empty bookings state
const EmptyBookings = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <p className="mb-4">No bookings found matching your criteria.</p>
    </div>
  );
};

// Create a component for the booking item
const BookingItem = ({ booking, index, handleViewDetails, handleUpdateStatus }) => {
  const machine = machines.find(m => m.id === booking.machineId);
  const machineType = machine?.type || 'Unknown machine';
  
  return (
    <div className="p-4 border-b border-gray-200 last:border-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-medium text-purple-800">{booking.userName || 'Unknown user'}</p>
          <p className="text-sm text-gray-600">{machine?.name || 'Unknown machine'} - {machineType}</p>
          <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-center">
          <span className={`text-xs px-2 py-1 rounded ${
            booking.status === 'Approved' 
              ? 'bg-green-100 text-green-800' 
              : booking.status === 'Canceled'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {booking.status}
          </span>
          
          <div className="flex gap-2 mt-0">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-purple-200 hover:bg-purple-50"
              onClick={() => handleViewDetails(booking.id)}
            >
              View
            </Button>
            
            {booking.status === 'Pending' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="border-green-200 hover:bg-green-50 text-green-600"
                onClick={() => handleUpdateStatus(booking.id, 'Approved')}
              >
                Approve
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [bookings, setBookings] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/home');
      return;
    }
    
    fetchData();
  }, [user, navigate]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get all users and their bookings
      const users = await userDatabase.getAllUsers();
      setAllUsers(users);
      
      // Extract all bookings from users
      let allBookings: any[] = [];
      users.forEach(user => {
        if (user.bookings && user.bookings.length > 0) {
          const userBookings = user.bookings.map((booking: any) => ({
            ...booking,
            userName: user.name,
            userEmail: user.email
          }));
          allBookings = [...allBookings, ...userBookings];
        }
      });
      
      setBookings(allBookings);
    } catch (error) {
      console.error('Error fetching booking data:', error);
      toast({
        title: "Error",
        description: "Failed to load booking data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = (bookingId: string) => {
    toast({
      title: "View Details",
      description: "Booking details view will be implemented soon"
    });
  };
  
  const handleUpdateStatus = (bookingId: string, status: string) => {
    try {
      // Update booking status in our local state
      const updatedBookings = bookings.map(booking => {
        if (booking.id === bookingId) {
          return { ...booking, status };
        }
        return booking;
      });
      
      setBookings(updatedBookings);
      
      // Show success message
      toast({
        title: "Status Updated",
        description: `Booking has been ${status.toLowerCase()}`
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };
  
  // Filter bookings based on search term and selected date
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.machineId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machines.find(m => m.id === booking.machineId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = selectedDate 
      ? booking.date === selectedDate.toISOString().split('T')[0]
      : true;
    
    return matchesSearch && matchesDate;
  });
  
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6">
          <BackToAdminButton />
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Active Bookings</h1>
        
        <BookingFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>Manage and monitor all machine bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block h-8 w-8 rounded-full border-4 border-t-blue-500 border-opacity-25 animate-spin"></div>
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="divide-y">
                {filteredBookings.map((booking, index) => (
                  <BookingItem 
                    key={booking.id}
                    booking={booking}
                    index={index}
                    handleViewDetails={handleViewDetails}
                    handleUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            ) : (
              <EmptyBookings />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveBookings;
