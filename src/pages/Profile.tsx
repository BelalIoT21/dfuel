
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { machines } from '../utils/data';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Get user certifications
  const userCertifications = machines
    .filter(machine => user?.certifications.includes(machine.id))
    .map(machine => ({
      id: machine.id,
      name: machine.name,
      date: new Date().toLocaleDateString() // In a real app, this would come from the database
    }));

  // Mock bookings for the current user (in a real app, these would be fetched from the backend)
  const userBookings = [
    {
      id: '1',
      machineId: 'laser-cutter',
      date: '2023-10-18',
      time: '2:00 PM - 3:00 PM',
      status: 'Approved'
    },
    {
      id: '2',
      machineId: 'ultimaker',
      date: '2023-10-25',
      time: '10:00 AM - 11:00 AM',
      status: 'Pending'
    }
  ];

  const handleSaveProfile = () => {
    updateProfile({ name, email });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/home" className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to Home
          </Link>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveProfile}>Save</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-500 text-sm">Full Name</Label>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-sm">Email</Label>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-sm">Account Type</Label>
                      <p className="font-medium">{user?.isAdmin ? 'Administrator' : 'User'}</p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Bookings</CardTitle>
                  <CardDescription>Recent and upcoming bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {userBookings.length > 0 ? (
                    <div className="space-y-4">
                      {userBookings.map((booking) => {
                        const machine = machines.find(m => m.id === booking.machineId);
                        return (
                          <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                            <div>
                              <p className="font-medium">{machine?.name}</p>
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
                              <Button variant="outline" size="sm">
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
                      <Button className="mt-2" asChild>
                        <Link to="/home">Book a Machine</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Your Certifications</CardTitle>
                  <CardDescription>Machines you are certified to use</CardDescription>
                </CardHeader>
                <CardContent>
                  {userCertifications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userCertifications.map((cert) => (
                        <div key={cert.id} className="border rounded-lg p-4">
                          <div className="font-medium">{cert.name}</div>
                          <div className="text-sm text-gray-500">Certified on: {cert.date}</div>
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <Link to={`/machine/${cert.id}`}>Book Now</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>You haven't completed any certifications yet.</p>
                      <Button className="mt-2" asChild>
                        <Link to="/home">Take a Safety Course</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
