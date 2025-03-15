
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { machines } from '../utils/data';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import userDatabase from '../services/userDatabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiService } from '@/services/apiService';

const AdminMachines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for new machine
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Cutting',
    status: 'Available',
    requiresCertification: true,
    difficulty: 'Intermediate',
    imageUrl: '/placeholder.svg',
  });
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userDatabase.getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    
    fetchUsers();
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

  // Filter out equipment and safety cabinets, only show actual machines
  const filteredMachines = machines
    .filter(machine => 
      machine.type !== 'Equipment' && 
      machine.type !== 'Safety Cabinet'
    )
    .filter(machine =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };

  const handleAddMachine = async () => {
    try {
      setIsSubmitting(true);
      
      // Call the API to create a new machine
      const response = await apiService.request(
        'machines', 
        'POST', 
        formData, 
        true
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast({
        title: "Machine Added",
        description: `${formData.name} has been added successfully.`
      });
      
      setIsAddingMachine(false);
      setFormData({
        name: '',
        description: '',
        type: 'Cutting',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/placeholder.svg',
      });
      
      // Reload the page to show the new machine
      window.location.reload();
    } catch (error) {
      console.error("Error adding machine:", error);
      toast({
        title: "Error Adding Machine",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMachine = (id: string) => {
    setEditingMachineId(id);
    const machine = machines.find(m => m.id === id);
    if (machine) {
      setFormData({
        name: machine.name,
        description: machine.description || '',
        type: machine.type || 'Cutting',
        status: 'Available',
        requiresCertification: machine.requiresCertification || true,
        difficulty: machine.difficulty || 'Intermediate',
        imageUrl: machine.image || '/placeholder.svg',
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsSubmitting(true);
      
      // Call the API to update the machine
      const response = await apiService.request(
        `machines/${editingMachineId}`, 
        'PUT', 
        formData, 
        true
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast({
        title: "Machine Updated",
        description: `${formData.name} has been updated successfully.`
      });
      
      setEditingMachineId(null);
      setFormData({
        name: '',
        description: '',
        type: 'Cutting',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/placeholder.svg',
      });
      
      // Reload the page to show the updated machine
      window.location.reload();
    } catch (error) {
      console.error("Error updating machine:", error);
      toast({
        title: "Error Updating Machine",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMachine = async (id: string) => {
    try {
      const response = await apiService.request(
        `machines/${id}`, 
        'DELETE', 
        undefined, 
        true
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast({
        title: "Machine Deleted",
        description: "The machine has been deleted successfully."
      });
      
      // Reload the page to update the machine list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting machine:", error);
      toast({
        title: "Error Deleting Machine",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Calculate real stats for each machine
  const getUsersCertifiedCount = (machineId: string) => {
    return allUsers.filter(user => 
      user.certifications && user.certifications.includes(machineId)
    ).length;
  };
  
  const getBookingsThisMonth = (machineId: string) => {
    let count = 0;
    allUsers.forEach(user => {
      if (user.bookings) {
        const machineBookings = user.bookings.filter((booking: any) => 
          booking.machineId === machineId
        );
        count += machineBookings.length;
      }
    });
    
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6">
          <BackToAdminButton />
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Machine Management</h1>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="w-full md:w-1/3">
                <Input
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Button onClick={() => setIsAddingMachine(true)}>
                  Add New Machine
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isAddingMachine && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Machine</CardTitle>
              <CardDescription>Enter the details for the new machine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Machine Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter machine name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Machine Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cutting">Cutting</SelectItem>
                      <SelectItem value="Printing">Printing</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Woodworking">Woodworking</SelectItem>
                      <SelectItem value="Metalworking">Metalworking</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter machine description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Out of Order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleSelectChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresCertification"
                    checked={formData.requiresCertification}
                    onCheckedChange={(checked) => handleSwitchChange('requiresCertification', checked)}
                  />
                  <Label htmlFor="requiresCertification">Requires Certification</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddMachine} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Machine'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingMachine(false)}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {editingMachineId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Edit Machine</CardTitle>
              <CardDescription>Update the details for this machine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Machine Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter machine name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Machine Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cutting">Cutting</SelectItem>
                      <SelectItem value="Printing">Printing</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Woodworking">Woodworking</SelectItem>
                      <SelectItem value="Metalworking">Metalworking</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter machine description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Out of Order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleSelectChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresCertification"
                    checked={formData.requiresCertification}
                    onCheckedChange={(checked) => handleSwitchChange('requiresCertification', checked)}
                  />
                  <Label htmlFor="requiresCertification">Requires Certification</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingMachineId(null)}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>All Machines</CardTitle>
            <CardDescription>Manage and monitor all machines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredMachines.length > 0 ? (
                filteredMachines.map((machine) => (
                  <div key={machine.id} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-0">
                    <div className="flex-shrink-0 w-full md:w-1/4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={machine.image}
                          alt={machine.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium">{machine.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{machine.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          Users Certified: {getUsersCertifiedCount(machine.id)}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                          Bookings: {getBookingsThisMonth(machine.id)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleEditMachine(machine.id)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/machine/${machine.id}`}>View</Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteMachine(machine.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No machines found matching your search criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMachines;
