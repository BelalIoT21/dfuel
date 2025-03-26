
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import CourseForm, { CourseFormData } from '@/components/admin/courses/CourseForm';
import { courseDatabaseService } from '@/services/database/courseService';
import { Slide, SlideElement, LegacySlide } from '@/components/admin/courses/CourseSlideEditor';

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
    slides: [{ id: '1', elements: [{ id: '1-1', type: 'heading', content: '', headingLevel: 1 }] }],
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
            // Try to parse slides from content
            let slides: Slide[] = [{ 
              id: '1', 
              elements: [{ 
                id: '1-1', 
                type: 'heading', 
                content: course.title || '', 
                headingLevel: 1 
              }] 
            }];
            
            if (course.content) {
              try {
                // First, try to parse as new slide format
                const parsedContent = JSON.parse(course.content);

                if (Array.isArray(parsedContent)) {
                  if (parsedContent.length > 0) {
                    // Check if it's the new format (with elements array) or legacy format
                    if ('elements' in parsedContent[0]) {
                      slides = parsedContent as Slide[];
                    } else {
                      // Convert legacy format to new format
                      slides = (parsedContent as LegacySlide[]).map(legacySlide => ({
                        id: legacySlide.id,
                        elements: [{ ...legacySlide, id: `${legacySlide.id}-1` }]
                      }));
                    }
                  }
                } else {
                  // If content exists but isn't valid slide array, create a text slide with it
                  slides = [
                    { 
                      id: '1', 
                      elements: [
                        { id: '1-1', type: 'heading', content: course.title || '', headingLevel: 1 },
                        { id: '1-2', type: 'text', content: course.content }
                      ] 
                    }
                  ];
                }
              } catch (e) {
                // If content exists but isn't valid JSON, create a text slide with it
                slides = [
                  { 
                    id: '1', 
                    elements: [
                      { id: '1-1', type: 'heading', content: course.title || '', headingLevel: 1 },
                      { id: '1-2', type: 'text', content: course.content }
                    ] 
                  }
                ];
              }
            }
            
            setFormData({
              title: course.title || '',
              description: course.description || '',
              category: course.category || 'Fabrication',
              content: course.content || '',
              difficulty: course.difficulty || 'Beginner',
              imageUrl: course.imageUrl || '',
              relatedMachineIds: course.relatedMachineIds || [],
              quizId: course.quizId || '',
              slides,
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
      
      // Ensure required fields have at least minimal content
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      
      // Set content to JSON string of slides
      const submissionData = {
        ...formData,
        content: JSON.stringify(formData.slides)
      };
      
      if (isEditing && id) {
        // Update existing course
        const success = await courseDatabaseService.updateCourse(id, submissionData);
        
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
        const result = await courseDatabaseService.createCourse(submissionData);
        
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
