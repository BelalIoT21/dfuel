
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { machines } from '../utils/data';

const AdminMachines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state for new machine
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '/placeholder.svg',
  });
  
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

  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddMachine = () => {
    // In a real app, this would make an API call to add the machine
    toast({
      title: "Machine Added",
      description: `${formData.name} has been added successfully.`
    });
    
    setIsAddingMachine(false);
    setFormData({
      name: '',
      description: '',
      image: '/placeholder.svg',
    });
  };

  const handleEditMachine = (id: string) => {
    setEditingMachineId(id);
    const machine = machines.find(m => m.id === id);
    if (machine) {
      setFormData({
        name: machine.name,
        description: machine.description,
        image: machine.image,
      });
    }
  };

  const handleSaveEdit = () => {
    // In a real app, this would make an API call to update the machine
    toast({
      title: "Machine Updated",
      description: `${formData.name} has been updated successfully.`
    });
    
    setEditingMachineId(null);
    setFormData({
      name: '',
      description: '',
      image: '/placeholder.svg',
    });
  };

  const handleDeleteMachine = (id: string) => {
    // In a real app, this would make an API call to delete the machine
    toast({
      title: "Machine Deleted",
      description: "The machine has been deleted successfully."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/admin" className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to Dashboard
          </Link>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter machine description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddMachine}>Add Machine</Button>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter machine description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
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
                          Users Certified: 12
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                          Bookings This Month: 34
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
