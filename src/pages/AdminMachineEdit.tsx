import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import MachineForm, { MachineFormData } from '@/components/admin/machines/MachineForm';
import { machineDatabaseService } from '@/services/database/machineService';
import { formatImageUrl } from '@/utils/env';

const AdminMachineEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MachineFormData>({
    name: '',
    description: '',
    type: 'Machine',
    status: 'Available', // Set a default status
    requiresCertification: false,
    difficulty: 'Beginner',
    imageUrl: '',
    linkedCourseId: '', // Ensure these fields are initialized
    linkedQuizId: ''    // Ensure these fields are initialized
  });
  const [loading, setLoading] = useState(true);
  const isEditing = !!id;

  // Helper function to format image URLs consistently
  const formatServerImageUrl = (url?: string) => {
    if (!url) return '';
    
    // For server paths, return as is (don't add API prefix here)
    // This is because we want to store the path in the DB, not the full URL
    if (url.startsWith('/utils/images')) {
      return url;
    }
    
    return url;
  };

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/home');
      return;
    }

    const loadMachine = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          console.log(`Loading machine with ID: ${id}...`);
          const machine = await machineDatabaseService.getMachineById(id);
          
          if (machine) {
            console.log("Loaded machine data:", machine);
            
            // Normalize status from API format to UI format
            let status = machine.status || 'Available';
            if (status === 'available') status = 'Available';
            if (status === 'maintenance') status = 'Maintenance';
            if (status === 'in-use') status = 'Out of Order';
            
            // CRITICAL FIX: Ensure requiresCertification is a proper boolean
            const requiresCertification = Boolean(machine.requiresCertification);
            console.log("Setting requiresCertification to:", requiresCertification, typeof requiresCertification);
            
            setFormData({
              name: machine.name || '',
              description: machine.description || '',
              type: machine.type || 'Machine',
              status: status,
              requiresCertification: requiresCertification,
              difficulty: machine.difficulty || 'Beginner',
              imageUrl: formatServerImageUrl(machine.imageUrl || machine.image || ''),
              details: machine.details || '',
              specifications: machine.specifications || '',
              certificationInstructions: machine.certificationInstructions || '',
              linkedCourseId: machine.linkedCourseId || '',
              linkedQuizId: machine.linkedQuizId || '',
              _id: machine._id
            });
          } else {
            console.error(`Machine with ID ${id} not found`);
            toast({
              title: 'Error',
              description: 'Machine not found',
              variant: 'destructive'
            });
            navigate('/admin/machines');
          }
        } catch (error) {
          console.error('Error loading machine:', error);
          toast({
            title: 'Error',
            description: 'Failed to load machine details',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      } else {
        // For new machines, just initialize defaults and exit loading state
        setLoading(false);
      }
    };

    loadMachine();
  }, [id, isEditing, navigate, toast, user?.isAdmin]);

  const validateForm = () => {
    // Check required fields
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Machine name is required',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!formData.type) {
      toast({
        title: 'Validation Error',
        description: 'Machine type is required',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Description is required',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!formData.status) {
      toast({
        title: 'Validation Error',
        description: 'Status is required',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!formData.difficulty) {
      toast({
        title: 'Validation Error',
        description: 'Difficulty level is required',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    // Validate required fields before submitting
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // CRITICAL FIX: Explicitly ensure requiresCertification is a boolean
      const dataToSubmit = {
        ...formData,
        requiresCertification: Boolean(formData.requiresCertification)
      };
      
      console.log("Submitting machine data:", dataToSubmit);
      console.log("requiresCertification:", dataToSubmit.requiresCertification, typeof dataToSubmit.requiresCertification);
      console.log("status:", dataToSubmit.status, typeof dataToSubmit.status);
      
      // Convert empty string values to null/undefined for the backend
      if (dataToSubmit.linkedCourseId === '') {
        dataToSubmit.linkedCourseId = null;
      }
      
      if (dataToSubmit.linkedQuizId === '') {
        dataToSubmit.linkedQuizId = null;
      }
      
      if (isEditing && id) {
        // Update existing machine
        try {
          // Critical change: explicitly set machineId as the first parameter
          const updatedMachine = await machineDatabaseService.updateMachine(id, dataToSubmit);
          
          if (updatedMachine) {
            toast({
              title: 'Success',
              description: 'Machine updated successfully'
            });
            navigate('/admin/machines');
          } else {
            throw new Error('Failed to update machine');
          }
        } catch (error) {
          console.error('Error updating machine:', error);
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update machine',
            variant: 'destructive'
          });
        }
      } else {
        // Create new machine
        try {
          const result = await machineDatabaseService.createMachine(dataToSubmit);
          
          if (result) {
            toast({
              title: 'Success',
              description: 'Machine created successfully'
            });
            navigate('/admin/machines');
          } else {
            throw new Error('Failed to create machine');
          }
        } catch (error) {
          console.error('Error creating machine:', error);
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to create machine',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Error submitting machine:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6">
          <BackToAdminButton />
        </div>
        
        <h1 className="text-3xl font-bold mb-6">
          {isEditing ? 'Edit Machine' : 'Add New Machine'}
        </h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Loading machine details...</p>
          </div>
        ) : (
          <MachineForm
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/machines')}
            title={isEditing ? 'Edit Machine' : 'Create New Machine'}
            description={isEditing ? 'Update machine details' : 'Add a new machine to the system'}
            submitLabel={isEditing ? 'Update Machine' : 'Create Machine'}
          />
        )}
      </div>
    </div>
  );
};

export default AdminMachineEdit;
