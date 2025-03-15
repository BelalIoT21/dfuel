import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { machines } from '../utils/data';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import userDatabase from '../services/userDatabase';
import { apiService } from '@/services/apiService';
import MachineForm, { MachineFormData } from '@/components/admin/machines/MachineForm';
import { machineDatabaseService } from '@/services/database/machineService';

const AdminMachines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [machinesList, setMachinesList] = useState<any[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const [formData, setFormData] = useState<MachineFormData>({
    name: '',
    description: '',
    type: 'Cutting',
    status: 'Available',
    requiresCertification: true,
    difficulty: 'Intermediate',
    imageUrl: '/placeholder.svg',
    details: '',
    specifications: '',
    certificationInstructions: '',
    linkedCourseId: '',
    linkedQuizId: '',
  });

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const fetchedMachines = await machineDatabaseService.getAllMachines();
        if (fetchedMachines && fetchedMachines.length > 0) {
          setMachinesList(fetchedMachines);
        } else {
          setMachinesList(machines);
        }
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching machines:", error);
        setMachinesList(machines);
        setInitialLoadComplete(true);
      }
    };

    const fetchUsers = async () => {
      try {
        const users = await userDatabase.getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    
    fetchMachines();
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

  const filteredMachines = machinesList
    .filter(machine => 
      machine.type !== 'Equipment' && 
      machine.type !== 'Safety Cabinet'
    )
    .filter(machine =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAddMachine = async () => {
    try {
      setIsSubmitting(true);
      
      const newMachine = await machineDatabaseService.createMachine(formData);
      
      if (!newMachine) {
        throw new Error("Failed to create machine");
      }
      
      toast({
        title: "Machine Added",
        description: `${formData.name} has been added successfully.`
      });
      
      setMachinesList(prev => [...prev, newMachine]);
      
      setIsAddingMachine(false);
      setFormData({
        name: '',
        description: '',
        type: 'Cutting',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/placeholder.svg',
        details: '',
        specifications: '',
        certificationInstructions: '',
        linkedCourseId: '',
        linkedQuizId: '',
      });
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
    const machine = machinesList.find(m => m.id === id || m._id === id);
    if (machine) {
      setFormData({
        name: machine.name,
        description: machine.description || '',
        type: machine.type || 'Cutting',
        status: machine.status || 'Available',
        requiresCertification: machine.requiresCertification !== undefined ? machine.requiresCertification : true,
        difficulty: machine.difficulty || 'Intermediate',
        imageUrl: machine.imageUrl || machine.image || '/placeholder.svg',
        details: machine.details || '',
        specifications: machine.specifications || '',
        certificationInstructions: machine.certificationInstructions || '',
        linkedCourseId: machine.linkedCourseId || '',
        linkedQuizId: machine.linkedQuizId || '',
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMachineId) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedMachine = await machineDatabaseService.updateMachine(editingMachineId, formData);
      
      if (!updatedMachine) {
        throw new Error("Failed to update machine");
      }
      
      toast({
        title: "Machine Updated",
        description: `${formData.name} has been updated successfully.`
      });
      
      setMachinesList(prev => 
        prev.map(m => 
          (m.id === editingMachineId || m._id === editingMachineId) 
            ? { ...m, ...updatedMachine } 
            : m
        )
      );
      
      setEditingMachineId(null);
      setFormData({
        name: '',
        description: '',
        type: 'Cutting',
        status: 'Available',
        requiresCertification: true,
        difficulty: 'Intermediate',
        imageUrl: '/placeholder.svg',
        details: '',
        specifications: '',
        certificationInstructions: '',
        linkedCourseId: '',
        linkedQuizId: '',
      });
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
      const success = await machineDatabaseService.deleteMachine(id);
      
      if (!success) {
        throw new Error("Failed to delete machine");
      }
      
      toast({
        title: "Machine Deleted",
        description: "The machine has been deleted successfully."
      });
      
      setMachinesList(prev => prev.filter(m => m.id !== id && m._id !== id));
    } catch (error) {
      console.error("Error deleting machine:", error);
      toast({
        title: "Error Deleting Machine",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

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

  const getMachineType = (type: string | undefined) => {
    if (!type || type === '') return 'Machine';
    return type;
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
          <MachineForm
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            onSubmit={handleAddMachine}
            onCancel={() => setIsAddingMachine(false)}
            title="Add New Machine"
            description="Enter the details for the new machine"
            submitLabel="Add Machine"
          />
        )}
        
        {editingMachineId && (
          <MachineForm
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            onSubmit={handleSaveEdit}
            onCancel={() => setEditingMachineId(null)}
            title="Edit Machine"
            description="Update the details for this machine"
            submitLabel="Save Changes"
          />
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>All Machines</CardTitle>
            <CardDescription>Manage and monitor all machines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!initialLoadComplete ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading machines...</p>
                </div>
              ) : filteredMachines.length > 0 ? (
                filteredMachines.map((machine) => (
                  <div key={machine.id || machine._id} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-0">
                    <div className="flex-shrink-0 w-full md:w-1/4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={machine.imageUrl || machine.image || '/placeholder.svg'}
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
                          Type: {getMachineType(machine.type)}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                          Difficulty: {machine.difficulty || 'Beginner'}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          Users Certified: {getUsersCertifiedCount(machine.id || machine._id)}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                          Bookings: {getBookingsThisMonth(machine.id || machine._id)}
                        </div>
                        {machine.linkedCourseId && (
                          <div className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">
                            Has Course
                          </div>
                        )}
                        {machine.linkedQuizId && (
                          <div className="text-xs px-2 py-1 rounded bg-cyan-100 text-cyan-800">
                            Has Quiz
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleEditMachine(machine.id || machine._id)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/machine/${machine.id || machine._id}`}>View</Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteMachine(machine.id || machine._id)}
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
