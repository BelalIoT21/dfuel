
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import CourseForm, { CourseFormData } from '@/components/admin/courses/CourseForm';
import { courseDatabaseService } from '@/services/database/courseService';

const AdminCourseEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: 'Fabrication',
    content: '',
    difficulty: 'Beginner',
    relatedMachineIds: [],
  });
  const [loading, setLoading] = useState(true);
  const isEditing = !!id;

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/home');
      return;
    }

    const loadCourse = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const course = await courseDatabaseService.getCourseById(id);
          
          if (course) {
            setFormData({
              title: course.title || '',
              description: course.description || '',
              category: course.category || 'Fabrication',
              content: course.content || '',
              difficulty: course.difficulty || 'Beginner',
              imageUrl: course.imageUrl || '',
              relatedMachineIds: course.relatedMachineIds || [],
              quizId: course.quizId || '',
            });
          }
        } catch (error) {
          console.error('Error loading course:', error);
          toast({
            title: 'Error',
            description: 'Failed to load course details',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, isEditing, navigate, toast, user?.isAdmin]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && id) {
        // Update existing course
        const success = await courseDatabaseService.updateCourse(id, formData);
        
        if (success) {
          toast({
            title: 'Success',
            description: 'Course updated successfully'
          });
          navigate('/admin/courses');
        } else {
          throw new Error('Failed to update course');
        }
      } else {
        // Create new course
        const result = await courseDatabaseService.createCourse(formData);
        
        if (result) {
          toast({
            title: 'Success',
            description: 'Course created successfully'
          });
          navigate('/admin/courses');
        } else {
          throw new Error('Failed to create course');
        }
      }
    } catch (error) {
      console.error('Error submitting course:', error);
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
          {isEditing ? 'Edit Course' : 'Add New Course'}
        </h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Loading course details...</p>
          </div>
        ) : (
          <CourseForm
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/courses')}
            title={isEditing ? 'Edit Course' : 'Create New Course'}
            description={isEditing ? 'Update course details' : 'Add a new course to the system'}
            submitLabel={isEditing ? 'Update Course' : 'Create Course'}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCourseEdit;
