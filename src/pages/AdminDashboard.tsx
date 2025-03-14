
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="mb-6">You need administrator privileges to access this page.</p>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto page-transition">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">10</CardTitle>
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">5</CardTitle>
              <CardDescription>Total Machines</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">8</CardTitle>
              <CardDescription>Active Bookings</CardDescription>
            </CardHeader>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link to="/admin/users">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Manage Users</span>
                      <span className="text-sm text-gray-500">View, edit, and manage user accounts</span>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/admin/machines">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Manage Machines</span>
                      <span className="text-sm text-gray-500">Add, edit, or remove machines</span>
                    </div>
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Manage Bookings</span>
                    <span className="text-sm text-gray-500">Review and approve booking requests</span>
                  </div>
                </Button>
                
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">System Settings</span>
                    <span className="text-sm text-gray-500">Configure system preferences</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-1">
                    <p className="font-medium">New User Registration</p>
                    <p className="text-sm text-gray-500">John Doe registered an account</p>
                    <p className="text-xs text-gray-400">10 minutes ago</p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4 py-1">
                    <p className="font-medium">New Booking</p>
                    <p className="text-sm text-gray-500">Jane Smith booked Laser Cutter</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4 py-1">
                    <p className="font-medium">Course Completed</p>
                    <p className="text-sm text-gray-500">Mike Johnson completed Ultimaker course</p>
                    <p className="text-xs text-gray-400">3 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Server Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Database</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Last Backup</span>
                    <span className="text-sm text-gray-500">
                      Today, 04:30 AM
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
