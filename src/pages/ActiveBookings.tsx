
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '../context/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import { machines } from '../utils/data';
import { CalendarClock, Search, FilterX } from 'lucide-react';

const ActiveBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // In a real app, we would fetch from API
    // Using mock data for demonstration
    const mockBookings = [
      { id: 'BK001', userId: 'user1', userName: 'John Doe', machineId: '1', machineName: '3D Printer', date: '2025-03-15', time: '09:00-10:00', status: 'Approved' },
      { id: 'BK002', userId: 'user2', userName: 'Jane Smith', machineId: '2', machineName: 'Laser Cutter', date: '2025-03-16', time: '11:00-12:00', status: 'Pending' },
      { id: 'BK003', userId: 'user3', userName: 'Bob Johnson', machineId: '3', machineName: 'CNC Router', date: '2025-03-17', time: '14:00-15:00', status: 'Approved' },
      { id: 'BK004', userId: 'user1', userName: 'John Doe', machineId: '4', machineName: 'Milling Machine', date: '2025-03-18', time: '16:00-17:00', status: 'Pending' },
      { id: 'BK005', userId: 'user4', userName: 'Sara Lee', machineId: '1', machineName: '3D Printer', date: '2025-03-15', time: '10:00-11:00', status: 'Approved' }
    ];
    
    setBookings(mockBookings);
    setFilteredBookings(mockBookings);
  }, []);

  useEffect(() => {
    let result = bookings;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(booking => 
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (filterDate) {
      const dateString = filterDate.toISOString().split('T')[0];
      result = result.filter(booking => booking.date === dateString);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(booking => booking.status.toLowerCase() === filterStatus.toLowerCase());
    }
    
    setFilteredBookings(result);
  }, [searchTerm, filterDate, filterStatus, bookings]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate(undefined);
    setFilterStatus('all');
  };

  const handleApprove = (bookingId: string) => {
    // In a real app, we would call an API
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? {...booking, status: 'Approved'} 
          : booking
      )
    );
  };

  const handleReject = (bookingId: string) => {
    // In a real app, we would call an API
    setBookings(prevBookings => 
      prevBookings.filter(booking => booking.id !== bookingId)
    );
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="mb-4">You need administrator privileges to view this page.</p>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Active Bookings</h1>
            <p className="text-gray-600">Manage all machine bookings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock size={18} />
                Today's Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredBookings.filter(b => b.status === 'Pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredBookings.length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
            <CardDescription>View and manage all machine bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={clearFilters}
                  title="Clear all filters"
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Filter by Date</h3>
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={setFilterDate}
                className="rounded border"
              />
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.userName}</TableCell>
                        <TableCell>{booking.machineName}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.time}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'Approved' 
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {booking.status === 'Pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="default" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(booking.id)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleReject(booking.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {booking.status === 'Approved' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 hover:bg-red-50"
                                onClick={() => handleReject(booking.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveBookings;
