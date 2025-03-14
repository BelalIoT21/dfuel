
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { machines } from '../utils/data';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="mb-4">You don't have permission to access this page.</p>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mock statistics for the admin dashboard
  const stats = [
    { title: 'Total Users', value: 124, change: '+12%' },
    { title: 'Total Machines', value: machines.length, change: '0%' },
    { title: 'Bookings Today', value: 8, change: '+33%' },
    { title: 'Pending Approvals', value: 5, change: '-15%' },
  ];

  // Mock recent activity
  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Booked Laser Cutter', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', action: 'Completed 3D Printer Course', time: '3 hours ago' },
    { id: 3, user: 'Mike Johnson', action: 'Passed CNC Mill Quiz', time: '5 hours ago' },
    { id: 4, user: 'Sarah Williams', action: 'Requested Booking Approval', time: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto page-transition">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview and management</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-500 flex items-center justify-between">
                  <span>{stat.title}</span>
                  <span className={`${
                    stat.change.startsWith('+') 
                      ? 'text-green-600' 
                      : stat.change.startsWith('-') 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex justify-between border-b pb-3 last:border-0">
                    <div>
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action}</span>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" asChild>
                <Link to="/admin/users">Manage Users</Link>
              </Button>
              <Button className="w-full justify-start" asChild>
                <Link to="/admin/machines">Manage Machines</Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Approve Bookings
              </Button>
              <Button className="w-full justify-start" variant="outline">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Bookings waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((booking) => (
                  <div key={booking} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <div className="font-medium">Laser Cutter Booking</div>
                      <div className="text-sm text-gray-500">User: John Doe</div>
                      <div className="text-sm text-gray-500">Oct 18, 2023 at 2:00 PM</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Approve</Button>
                      <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">Deny</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Machine Status</CardTitle>
              <CardDescription>Current status of all machines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {machines.map((machine) => (
                  <div key={machine.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <div className="font-medium">{machine.name}</div>
                      <div className="text-sm text-gray-500">
                        Next booking: Today at 4:00 PM
                      </div>
                    </div>
                    <div>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        Available
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
