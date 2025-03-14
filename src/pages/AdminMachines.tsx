
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { machines } from '../utils/data';

const AdminMachines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [allMachines, setAllMachines] = useState(machines);
  const [editingMachine, setEditingMachine] = useState<typeof machines[0] | null>(null);
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: '',
    description: '',
    image: '/placeholder.svg',
  });
  
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

  const filteredMachines = allMachines.filter(machine => 
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    machine.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditMachine = (updatedMachine: typeof machines[0]) => {
    // In a real app, this would call an API to update the machine
    setAllMachines(allMachines.map(machine => 
      machine.id === updatedMachine.id ? updatedMachine : machine
    ));
    setEditingMachine(null);
    
    toast({
      title: "Machine updated",
      description: "Machine information has been updated successfully.",
    });
  };

  const handleAddMachine = () => {
    if (!newMachine.name || !newMachine.description) {
      toast({
        title: "Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would call an API to add the machine
    const newId = (Math.max(...allMachines.map(m => parseInt(m.id))) + 1).toString();
    
    setAllMachines([
      ...allMachines, 
      {
        id: newId,
        name: newMachine.name,
        description: newMachine.description,
        image: newMachine.image,
        courseCompleted: false,
        quizPassed: false,
      }
    ]);
    
    setNewMachine({
      name: '',
      description: '',
      image: '/placeholder.svg',
    });
    
    setIsAddingMachine(false);
    
    toast({
      title: "Machine added",
      description: "New machine has been added successfully.",
    });
  };

  const handleDeleteMachine = (id: string) => {
    // In a real app, this would call an API to delete the machine
    setAllMachines(allMachines.filter(machine => machine.id !== id));
    
    toast({
      title: "Machine deleted",
      description: "The machine has been deleted successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Machines</h1>
          <div className="flex gap-4">
            <Link to="/admin">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Machine Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <Input
                placeholder="Search machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Dialog open={isAddingMachine} onOpenChange={setIsAddingMachine}>
                <DialogTrigger asChild>
                  <Button>Add New Machine</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Machine</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Machine Name</Label>
                      <Input 
                        id="name" 
                        value={newMachine.name}
                        onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={newMachine.description}
                        onChange={(e) => setNewMachine({...newMachine, description: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingMachine(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMachine}>
                        Add Machine
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMachines.map(machine => (
                <Card key={machine.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100">
                    <img 
                      src={machine.image} 
                      alt={machine.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{machine.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{machine.description}</p>
                    <div className="flex justify-between items-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingMachine(machine)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        {editingMachine && editingMachine.id === machine.id && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Machine</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Machine Name</Label>
                                <Input 
                                  id="edit-name" 
                                  value={editingMachine.name}
                                  onChange={(e) => setEditingMachine({...editingMachine, name: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea 
                                  id="edit-description" 
                                  value={editingMachine.description}
                                  onChange={(e) => setEditingMachine({...editingMachine, description: e.target.value})}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingMachine(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={() => handleEditMachine(editingMachine)}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteMachine(machine.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredMachines.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No machines matching your search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMachines;
