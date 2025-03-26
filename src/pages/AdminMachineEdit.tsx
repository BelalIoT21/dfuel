
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import MachineForm, { MachineFormData } from '@/components/admin/machines/MachineForm';
import { machineDatabaseService } from '@/services/database/machineService';

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
    status: 'Available',
    requiresCertification: false,
    difficulty: 'Beginner',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const isEditing = !!id;

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/home');
      return;
    }

    const loadMachine = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const machine = await machineDatabaseService.getMachineById(id);
          
          if (machine) {
            console.log("Loaded machine data:", machine);
            setFormData({
              name: machine.name || '',
              description: machine.description || '',
              type: machine.type || 'Machine',
              status: machine.status || 'Available',
              requiresCertification: machine.requiresCertification || false,
              difficulty: machine.difficulty || 'Beginner',
              imageUrl: machine.imageUrl || '',
              details: machine.details || '',
              specifications: machine.specifications || '',
              certificationInstructions: machine.certificationInstructions || '',
              linkedCourseId: machine.linkedCourseId || '',
              linkedQuizId: machine.linkedQuizId || '',
              _id: machine._id
            });
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
      console.log("Submitting machine data:", formData);
      
      if (isEditing && id) {
        // Update existing machine
        const success = await machineDatabaseService.updateMachine(id, formData);
        
        if (success) {
          toast({
            title: 'Success',
            description: 'Machine updated successfully'
          });
          navigate('/admin/machines');
        } else {
          throw new Error('Failed to update machine');
        }
      } else {
        // Create new machine
        const result = await machineDatabaseService.createMachine(formData);
        
        if (result) {
          toast({
            title: 'Success',
            description: 'Machine created successfully'
          });
          navigate('/admin/machines');
        } else {
          throw new Error('Failed to create machine');
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
