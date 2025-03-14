
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { machines } from '../utils/data';
import userDatabase from '../services/userDatabase';
import { 
  Users, 
  Settings, 
  BookOpen, 
  Activity, 
  Check, 
  X, 
  AlertTriangle,
  BarChart,
  CalendarClock,
  UserCheck,
  Wrench,
  ArrowLeft
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [machineData, setMachineData] = useState<any[]>([]);
  const [isMachineStatusDialogOpen, setIsMachineStatusDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('available');
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Load users and machine data
    const users = userDatabase.getAllUsers();
    setAllUsers(users);
    
    // Get machine statuses
    const machinesWithStatus = machines.map(machine => {
      const status = userDatabase.getMachineStatus(machine.id);
      return {
        ...machine,
        status: status || 'available'
      };
    });
    setMachineData(machinesWithStatus);
  }, []);
  
  if (!user?.isAdmin) {
    navigate('/home');
    return null;
  }

  // Basic statistics for the admin dashboard
  const stats = [
    { 
      title: 'Total Users', 
      value: allUsers.length, 
      icon: <Users className="h-5 w-5 text-purple-600" />,
      change: allUsers.length > 0 ? '+' + allUsers.length : '0',
      link: '/admin/users'
    },
    { 
      title: 'Total Machines', 
      value: machines.length, 
      icon: <Settings className="h-5 w-5 text-purple-600" />,
      change: '0%',
      link: '/admin/machines'
    },
    { 
      title: 'Certifications', 
      value: allUsers.reduce((total, user) => total + user.certifications.length, 0), 
      icon: <UserCheck className="h-5 w-5 text-purple-600" />,
      change: '+' + allUsers.reduce((total, user) => total + user.certifications.length, 0),
      link: '/admin/users'
    },
    { 
      title: 'Active Bookings', 
      value: allUsers.reduce((total, user) => total + (user.bookings ? user.bookings.length : 0), 0), 
      icon: <CalendarClock className="h-5 w-5 text-orange-600" />,
      change: allUsers.reduce((total, user) => total + (user.bookings ? user.bookings.length : 0), 0) > 0 ? 
        '+' + allUsers.reduce((total, user) => total + (user.bookings ? user.bookings.length : 0), 0) : '0',
      link: '/admin/bookings'
    },
  ];

  const handleUpdateMachineStatus = (machine: any) => {
    setSelectedMachine(machine);
    setSelectedStatus(machine.status || 'available');
    setMaintenanceNote('');
    setIsMachineStatusDialogOpen(true);
  };

  const saveMachineStatus = () => {
    if (!selectedMachine) return;
    
    // Update machine status in the database
    userDatabase.updateMachineStatus(selectedMachine.id, selectedStatus, maintenanceNote);
    
    // Update local state
    setMachineData(machineData.map(machine => 
      machine.id === selectedMachine.id 
        ? { ...machine, status: selectedStatus } 
        : machine
    ));
    
    setIsMachineStatusDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-7xl mx-auto page-transition">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-purple-800">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Learnit Platform Management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/profile')} className="border-purple-200 hover:bg-purple-50 text-xs md:text-sm">
              My Profile
            </Button>
            <Button variant="outline" onClick={logout} className="border-purple-200 hover:bg-purple-50 text-xs md:text-sm">
              Logout
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-purple-100 hover:shadow-md transition-all">
              <CardContent className="p-3 md:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg md:text-2xl font-bold text-purple-800">{stat.value}</div>
                    <div className="text-xs md:text-sm text-gray-600">{stat.title}</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-full">
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center text-xs md:text-sm">
                  <span className={`${
                    stat.change.startsWith('+') 
                      ? 'text-green-600' 
                      : stat.change.startsWith('-') 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  <Link to={stat.link} className="text-purple-600 hover:underline">View</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          <Card className="lg:col-span-2 border-purple-100">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Activity className="h-5 w-5 text-purple-600" />
                Platform Overview
              </CardTitle>
              <CardDescription>Current status of the Learnit platform</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-2">Recent User Activity</h3>
                  {allUsers.length > 0 ? (
                    <div className="space-y-3">
                      {allUsers.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex justify-between border-b pb-2 last:border-0">
                          <div>
                            <span className="font-medium text-sm">{user.name}</span>
                            <div className="text-xs text-gray-500">Last login: {new Date(user.lastLogin).toLocaleString()}</div>
                          </div>
                          <div className="text-xs">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              {user.certifications.length} certifications
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No user activity recorded yet.</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-2">System Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    <div className="border rounded-lg p-2 md:p-3 bg-green-50 border-green-100">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-xs md:text-sm font-medium text-green-800">System Online</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-2 md:p-3 bg-green-50 border-green-100">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-xs md:text-sm font-medium text-green-800">Courses Active</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-2 md:p-3 bg-green-50 border-green-100">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-xs md:text-sm font-medium text-green-800">Booking System</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-2 md:p-3 bg-green-50 border-green-100">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-xs md:text-sm font-medium text-green-800">Quiz Engine</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-100">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-3">
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-sm" asChild>
                <Link to="/admin/users">Manage Users</Link>
              </Button>
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-sm" asChild>
                <Link to="/admin/machines">Manage Machines</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                {/* Show actual pending bookings if they exist, otherwise show informational message */}
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No pending actions at this time.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-100">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Wrench className="h-5 w-5 text-purple-600" />
                Machine Status
              </CardTitle>
              <CardDescription>Current status of all machines</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3">
                {machineData.length > 0 ? (
                  machineData.map((machine) => (
                    <div key={machine.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <div className="font-medium text-sm">{machine.name}</div>
                        <div className="text-xs text-gray-500">
                          {machine.maintenanceNote ? `Note: ${machine.maintenanceNote}` : 'No maintenance notes'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          machine.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : machine.status === 'maintenance'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {machine.status === 'available' 
                            ? 'Available' 
                            : machine.status === 'maintenance'
                              ? 'Maintenance'
                              : 'In Use'}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-purple-200 hover:bg-purple-50 text-xs"
                          onClick={() => handleUpdateMachineStatus(machine)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No machines available yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Dialog open={isMachineStatusDialogOpen} onOpenChange={setIsMachineStatusDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Machine Status</DialogTitle>
              <DialogDescription>
                Change the current status of {selectedMachine?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="machine-status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="machine-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="in-use">In Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedStatus === 'maintenance' && (
                <div className="space-y-2">
                  <Label htmlFor="maintenance-note">Maintenance Note</Label>
                  <Input
                    id="maintenance-note"
                    value={maintenanceNote}
                    onChange={(e) => setMaintenanceNote(e.target.value)}
                    placeholder="Optional: Describe the maintenance issue"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMachineStatusDialogOpen(false)} className="border-purple-200">
                Cancel
              </Button>
              <Button onClick={saveMachineStatus} className="bg-purple-600 hover:bg-purple-700">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
