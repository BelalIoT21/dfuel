import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

const PlatformOverview = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllMachines, setShowAllMachines] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [machineSearchQuery, setMachineSearchQuery] = useState('');

  const handleViewMachine = (machine) => {
    setSelectedMachine(machine);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 overflow-hidden">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>

        <div className="h-[calc(100vh-120px)] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users Overview Card */}
            <Card className="shadow-lg border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
                <CardTitle className="text-2xl text-purple-800">Users Overview</CardTitle>
                <CardDescription>Total registered users: {users.length}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recent Users</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllUsers(!showAllUsers)}
                    >
                      {showAllUsers ? 'Show Less' : 'Show All'}
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <div className="h-[300px] overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Joined</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredUsers.slice(0, showAllUsers ? undefined : 5).map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{user.name}</td>
                                <td className="px-4 py-2 text-sm">{user.email}</td>
                                <td className="px-4 py-2 text-sm">
                                  {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Overview Card */}
            <Card className="shadow-lg border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
                <CardTitle className="text-2xl text-purple-800">Bookings Overview</CardTitle>
                <CardDescription>Total bookings: {bookings.length}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recent Bookings</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllBookings(!showAllBookings)}
                    >
                      {showAllBookings ? 'Show Less' : 'Show All'}
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search bookings..."
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <div className="h-[300px] overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">User</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Machine</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredBookings.slice(0, showAllBookings ? undefined : 5).map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{booking.userName}</td>
                                <td className="px-4 py-2 text-sm">{booking.machineName}</td>
                                <td className="px-4 py-2 text-sm">
                                  {format(new Date(booking.date), 'MMM d, yyyy')}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Machines Overview Card */}
          <Card className="shadow-lg border-purple-100 mt-6">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
              <CardTitle className="text-2xl text-purple-800">Machines Overview</CardTitle>
              <CardDescription>Total machines: {machines.length}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">All Machines</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllMachines(!showAllMachines)}
                  >
                    {showAllMachines ? 'Show Less' : 'Show All'}
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search machines..."
                    value={machineSearchQuery}
                    onChange={(e) => setMachineSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="h-[300px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredMachines.slice(0, showAllMachines ? undefined : 5).map((machine) => (
                            <tr key={machine.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">{machine.name}</td>
                              <td className="px-4 py-2 text-sm">{machine.type}</td>
                              <td className="px-4 py-2 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${getMachineStatusColor(machine.status)}`}>
                                  {machine.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewMachine(machine)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Machine Details Dialog */}
      <Dialog open={!!selectedMachine} onOpenChange={() => setSelectedMachine(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Machine Details</DialogTitle>
          </DialogHeader>
          {selectedMachine && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Name</h4>
                  <p>{selectedMachine.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type</h4>
                  <p>{selectedMachine.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getMachineStatusColor(selectedMachine.status)}`}>
                      {selectedMachine.status}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p>{selectedMachine.location}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1">{selectedMachine.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformOverview; 