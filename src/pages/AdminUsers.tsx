
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import userDatabase from '../services/userDatabase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { machines } from '../utils/data';

const AdminUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  useEffect(() => {
    // Get all users from the database
    const allUsers = userDatabase.getAllUsers();
    setUsers(allUsers);
  }, []);

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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (userId: string, newStatus: 'Active' | 'Inactive') => {
    // In a real app, this would update the database
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    
    toast({
      title: "User Updated",
      description: `User status has been changed to ${newStatus}.`
    });
  };

  const handleAddUser = () => {
    // Validate input
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would add to the database
    const registeredUser = userDatabase.registerUser(
      newUser.email,
      newUser.password,
      newUser.name
    );

    if (registeredUser) {
      setUsers([...users, registeredUser]);
      toast({
        title: "User Added",
        description: "New user has been added successfully."
      });
      setIsAddingUser(false);
      setNewUser({ name: '', email: '', password: '' });
    } else {
      toast({
        title: "Error",
        description: "Email is already in use",
        variant: "destructive"
      });
    }
  };

  const handleAddCertification = (userId: string, machineId: string) => {
    // In a real app, this would update the database
    const success = userDatabase.addCertification(userId, machineId);
    
    if (success) {
      // Update local state to reflect the change
      setUsers(users.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              certifications: u.certifications.includes(machineId) 
                ? u.certifications 
                : [...u.certifications, machineId] 
            } 
          : u
      ));
      
      toast({
        title: "Certification Added",
        description: "User certification has been updated."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/admin" className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="w-full md:w-1/3">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="whitespace-nowrap">
                  Export Users
                </Button>
                <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
                  <DialogTrigger asChild>
                    <Button className="whitespace-nowrap">Add New User</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account with the form below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingUser(false)}>Cancel</Button>
                      <Button onClick={handleAddUser}>Add User</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage and monitor user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Last Login</th>
                    <th className="pb-3 font-medium">Certifications</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3">{user.name}</td>
                        <td className="py-3">{user.email}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3">{new Date(user.lastLogin).toLocaleString()}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {user.certifications.length > 0 ? (
                              user.certifications.map((cert: string) => {
                                const machine = machines.find(m => m.id === cert);
                                return (
                                  <span 
                                    key={cert} 
                                    className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                                  >
                                    {machine?.name || cert}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-xs text-gray-500">None</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Manage</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Manage User: {user.name}</DialogTitle>
                                <DialogDescription>
                                  Manage certifications and settings for this user.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <h4 className="text-sm font-medium mb-2">Add Certification</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {machines.map(machine => (
                                    <Button
                                      key={machine.id}
                                      variant="outline"
                                      size="sm"
                                      className={user.certifications.includes(machine.id) ? "bg-green-50" : ""}
                                      onClick={() => handleAddCertification(user.id, machine.id)}
                                    >
                                      {machine.name}
                                      {user.certifications.includes(machine.id) && " ✓"}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline">Reset Password</Button>
                                <Button variant="destructive">Delete User</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No users found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
