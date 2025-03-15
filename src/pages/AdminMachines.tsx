
import React, { useState, useEffect } from 'react';
import { machineDatabaseService } from '@/services/database/machineService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Pencil, Trash2, AlertCircle } from 'lucide-react';
import MachineForm, { MachineFormData, initialFormData } from '@/components/admin/machines/MachineForm';

const AdminMachines = () => {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MachineFormData>({...initialFormData});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch all machines on component mount
  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching machines from API...");
      const machinesData = await machineDatabaseService.getAllMachines();
      
      if (machinesData.length > 0) {
        console.log(`Fetched ${machinesData.length} machines`);
        setMachines(machinesData);
      } else {
        console.log("No machines found, using demo data");
        // Here we might want to use some demo data if needed
        setMachines([]);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setError('Failed to load machines. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load machines',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async () => {
    try {
      setIsSubmitting(true);
      console.log("Creating machine with data:", formData);
      
      // Send request to create machine
      const response = await machineDatabaseService.createMachine(formData);
      console.log("Machine creation response:", response);
      
      if (response) {
        toast({
          title: 'Success',
          description: 'Machine created successfully',
        });
        
        // Add the new machine to the list
        setMachines(prev => [...prev, response]);
        
        // Reset form and close dialog
        setFormData({...initialFormData});
        setIsAddDialogOpen(false);
      } else {
        throw new Error("Failed to create machine");
      }
    } catch (error) {
      console.error('Error adding machine:', error);
      toast({
        title: 'Error',
        description: 'Failed to create machine',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMachine = async () => {
    if (!selectedMachineId) return;
    
    try {
      setIsSubmitting(true);
      
      // Send request to update machine
      const response = await machineDatabaseService.updateMachine(selectedMachineId, formData);
      
      if (response) {
        toast({
          title: 'Success',
          description: 'Machine updated successfully',
        });
        
        // Update the machine in the list
        setMachines(prev => 
          prev.map(machine => 
            machine._id === selectedMachineId ? response : machine
          )
        );
        
        // Reset form and close dialog
        setFormData({...initialFormData});
        setIsEditDialogOpen(false);
        setSelectedMachineId(null);
      } else {
        throw new Error("Failed to update machine");
      }
    } catch (error) {
      console.error('Error updating machine:', error);
      toast({
        title: 'Error',
        description: 'Failed to update machine',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMachine = async () => {
    if (!selectedMachineId) return;
    
    try {
      setIsSubmitting(true);
      
      // Send request to delete machine
      const success = await machineDatabaseService.deleteMachine(selectedMachineId);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Machine deleted successfully',
        });
        
        // Remove the machine from the list
        setMachines(prev => prev.filter(machine => machine._id !== selectedMachineId));
        
        // Close dialog and reset selected machine
        setIsDeleteDialogOpen(false);
        setSelectedMachineId(null);
      } else {
        throw new Error("Failed to delete machine");
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete machine',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditClick = (machine: any) => {
    setSelectedMachineId(machine._id);
    // Format machine data to match form structure
    const machineFormData: MachineFormData = {
      name: machine.name,
      description: machine.description,
      type: machine.type,
      status: machine.status,
      requiresCertification: machine.requiresCertification,
      difficulty: machine.difficulty || 'Intermediate',
      imageUrl: machine.imageUrl || '/placeholder.svg',
      details: machine.details || '',
      specifications: machine.specifications || '',
      certificationInstructions: machine.certificationInstructions || '',
      linkedCourseId: machine.linkedCourseId || '',
      linkedQuizId: machine.linkedQuizId || '',
    };
    setFormData(machineFormData);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (machineId: string) => {
    setSelectedMachineId(machineId);
    setIsDeleteDialogOpen(true);
  };

  const handleAddCancel = () => {
    setFormData({...initialFormData});
    setIsAddDialogOpen(false);
  };

  const handleEditCancel = () => {
    setFormData({...initialFormData});
    setIsEditDialogOpen(false);
    setSelectedMachineId(null);
  };

  const renderStatusBadge = (status: string) => {
    let color = '';
    switch (status) {
      case 'Available':
        color = 'bg-green-100 text-green-800';
        break;
      case 'Maintenance':
        color = 'bg-yellow-100 text-yellow-800';
        break;
      case 'Out of Order':
        color = 'bg-red-100 text-red-800';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
    }
    return <Badge className={color}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        <span className="ml-2">Loading machines...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="mr-2" />
            Error
          </CardTitle>
          <CardDescription>
            There was an error loading the machines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={fetchMachines} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Machines</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription>
                Create a new machine for the system. Fill in all the required fields.
              </DialogDescription>
            </DialogHeader>
            <MachineForm
              formData={formData}
              setFormData={setFormData}
              isSubmitting={isSubmitting}
              onSubmit={handleAddMachine}
              onCancel={handleAddCancel}
              title="Add New Machine"
              description="Create a new machine in the system"
              submitLabel="Create Machine"
            />
          </DialogContent>
        </Dialog>
      </div>

      {machines.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Machines Found</CardTitle>
            <CardDescription>
              There are no machines in the system yet. Click "Add Machine" to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Your First Machine
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Machine List</CardTitle>
            <CardDescription>
              Manage your machines from this panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.map((machine) => (
                  <TableRow key={machine._id}>
                    <TableCell className="font-medium">{machine.name}</TableCell>
                    <TableCell>{machine.type}</TableCell>
                    <TableCell>{renderStatusBadge(machine.status)}</TableCell>
                    <TableCell>
                      {machine.requiresCertification ? (
                        <Badge className="bg-blue-100 text-blue-800">Required</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Not Required</Badge>
                      )}
                    </TableCell>
                    <TableCell>{machine.difficulty || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(machine)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteClick(machine._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Machine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Machine</DialogTitle>
            <DialogDescription>
              Update the details for this machine.
            </DialogDescription>
          </DialogHeader>
          <MachineForm
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            onSubmit={handleEditMachine}
            onCancel={handleEditCancel}
            title="Edit Machine"
            description="Update machine details"
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              machine and remove any associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMachine}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMachines;
