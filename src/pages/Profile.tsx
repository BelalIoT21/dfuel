
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Dummy booking data
  const bookings = [
    { id: 1, machine: 'Laser Cutter', date: 'June 15, 2023', time: '10:00 - 11:00', status: 'confirmed' },
    { id: 2, machine: 'Ultimaker', date: 'June 20, 2023', time: '14:00 - 15:00', status: 'pending' },
  ];
  
  // Dummy certification data
  const certifications = [
    { id: 1, machine: 'Laser Cutter', completed: true },
    { id: 2, machine: 'Ultimaker', completed: true },
    { id: 3, machine: 'Safety Cabinet', completed: false },
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user profile
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleCancelBooking = (id: number) => {
    // In a real app, this would call an API to cancel the booking
    toast({
      title: "Booking cancelled",
      description: "Your booking has been cancelled successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-5xl mx-auto page-transition">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <div className="flex gap-4">
            <Link to="/home">
              <Button variant="outline">Home</Button>
            </Link>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                  
                  <Button type="submit">Update Profile</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex flex-col md:flex-row justify-between border rounded-lg p-4">
                        <div>
                          <h3 className="font-medium">{booking.machine}</h3>
                          <p className="text-sm text-gray-500">{booking.date} • {booking.time}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel Booking
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
                    <Link to="/home">
                      <Button>Book a Machine</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="certifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                {certifications.length > 0 ? (
                  <div className="space-y-4">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-center border rounded-lg p-4">
                        <div>
                          <h3 className="font-medium">{cert.machine}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                            cert.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cert.completed ? 'Certified' : 'Not Certified'}
                          </span>
                        </div>
                        {!cert.completed && (
                          <Link to="/home">
                            <Button size="sm">Get Certified</Button>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You don't have any certifications yet.</p>
                    <Link to="/home">
                      <Button>Get Certified</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
