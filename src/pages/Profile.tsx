
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { machines } from '../utils/data';
import { Eye, EyeOff, User, Key, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Profile = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Get user certifications
  const userCertifications = machines
    .filter(machine => user?.certifications.includes(machine.id))
    .map(machine => ({
      id: machine.id,
      name: machine.name,
      date: new Date().toLocaleDateString() // In a real app, this would come from the database
    }));

  // Get active bookings for the current user
  const [userBookings, setUserBookings] = useState([]);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleSaveProfile = () => {
    updateProfile({ name, email });
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      setIsPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/home" className="text-purple-600 hover:underline flex items-center gap-1">
            &larr; Back to Home
          </Link>
          <Button variant="outline" onClick={logout} className="border-purple-200 hover:bg-purple-50">
            Logout
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-6 text-purple-800">Your Profile</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} className="text-purple-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Manage your account details</CardDescription>
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
                      <Button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="border-purple-200">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-500 text-sm">Full Name</Label>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500 text-sm">Email</Label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-500 text-sm">Account Type</Label>
                        <p className="font-medium">{user.isAdmin ? 'Administrator' : 'User'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500 text-sm">Last Login</Label>
                        <p className="font-medium">{new Date(user.lastLogin).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                        className="border-purple-200 hover:bg-purple-50"
                      >
                        Edit Profile
                      </Button>
                      
                      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsPasswordDialogOpen(true)}
                          className="border-purple-200 hover:bg-purple-50"
                        >
                          Change Password
                        </Button>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Your Password</DialogTitle>
                            <DialogDescription>
                              Enter your current password and a new password below.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                            
                            <div className="space-y-2">
                              <Label htmlFor="current-password">Current Password</Label>
                              <div className="relative">
                                <Input
                                  id="current-password"
                                  type={showCurrentPassword ? "text" : "password"}
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  className="pr-10"
                                />
                                <button 
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showNewPassword ? "text" : "password"}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="pr-10"
                                />
                                <button 
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm New Password</Label>
                              <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} className="border-purple-200">
                              Cancel
                            </Button>
                            <Button onClick={handleChangePassword} className="bg-purple-600 hover:bg-purple-700">
                              Change Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="certifications">
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key size={20} className="text-purple-600" />
                  Your Certifications
                </CardTitle>
                <CardDescription>Machines you are certified to use</CardDescription>
              </CardHeader>
              <CardContent>
                {userCertifications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userCertifications.map((cert) => (
                      <div key={cert.id} className="border border-purple-100 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                        <div className="font-medium text-purple-800">{cert.name}</div>
                        <div className="text-sm text-gray-500">Certified on: {cert.date}</div>
                        <Button variant="outline" size="sm" className="mt-2 border-purple-200 hover:bg-purple-100" asChild>
                          <Link to={`/machine/${cert.id}`}>Book Now</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't completed any certifications yet.</p>
                    <Button className="mt-2 bg-purple-600 hover:bg-purple-700" asChild>
                      <Link to="/home">Take a Safety Course</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings">
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail size={20} className="text-purple-600" />
                  Your Bookings
                </CardTitle>
                <CardDescription>Recent and upcoming bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {user.bookings && user.bookings.length > 0 ? (
                  <div className="space-y-4">
                    {user.bookings.map((booking: any) => {
                      const machine = machines.find(m => m.id === booking.machineId);
                      return (
                        <div key={booking.id} className="flex items-center justify-between border-b border-purple-100 pb-4 last:border-0">
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
                      <Link to="/home">Book a Machine</Link>
                    </Button>
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
