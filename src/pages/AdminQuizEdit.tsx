
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import QuizForm, { QuizFormData } from '@/components/admin/quizzes/QuizForm';
import { quizDatabaseService } from '@/services/database/quizService';

const AdminQuizEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    category: 'Fabrication',
    questions: [{
      question: '',
      options: ['', '', ''],
      correctAnswer: 0,
    }],
    passingScore: 70,
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

    const loadQuiz = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const quiz = await quizDatabaseService.getQuizById(id);
          
          if (quiz) {
            console.log('Loaded quiz data:', quiz);
            setFormData({
              title: quiz.title || '',
              description: quiz.description || '',
              category: quiz.category || 'Fabrication',
              questions: quiz.questions?.length > 0 ? quiz.questions : [{
                question: '',
                options: ['', '', ''],
                correctAnswer: 0,
              }],
              passingScore: quiz.passingScore || 70,
              difficulty: quiz.difficulty || 'Beginner',
              imageUrl: quiz.imageUrl || '',
              relatedMachineIds: quiz.relatedMachineIds || [],
              relatedCourseId: quiz.relatedCourseId || '',
            });
          }
        } catch (error) {
          console.error('Error loading quiz:', error);
          toast({
            title: 'Error',
            description: 'Failed to load quiz details',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id, isEditing, navigate, toast, user?.isAdmin]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form data 
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      
      // Validate questions
      if (!formData.questions || formData.questions.length === 0) {
        throw new Error('At least one question is required');
      }
      
      // Clean up option values and validate each question
      const cleanedQuestions = formData.questions.map(q => {
        // Filter out empty options
        const filteredOptions = q.options.filter(opt => opt.trim() !== '');
        
        if (!q.question.trim()) {
          throw new Error('All questions must have content');
        }
        
        if (filteredOptions.length < 2) {
          throw new Error('Each question must have at least 2 options');
        }
        
        // Adjust correctAnswer if needed after filtering options
        let correctAnswer = q.correctAnswer;
        if (correctAnswer >= filteredOptions.length) {
          correctAnswer = 0;
        }
        
        return {
          ...q,
          question: q.question.trim(),
          options: filteredOptions,
          correctAnswer: correctAnswer,
        };
      });
      
      const cleanedFormData = {
        ...formData,
        questions: cleanedQuestions,
      };
      
      console.log('Submitting quiz data:', cleanedFormData);
      
      if (isEditing && id) {
        // Update existing quiz
        const success = await quizDatabaseService.updateQuiz(id, cleanedFormData);
        
        if (success) {
          toast({
            title: 'Success',
            description: 'Quiz updated successfully'
          });
          navigate('/admin/quizzes');
        } else {
          throw new Error('Failed to update quiz');
        }
      } else {
        // Create new quiz
        const result = await quizDatabaseService.createQuiz(cleanedFormData);
        
        if (result) {
          toast({
            title: 'Success',
            description: 'Quiz created successfully'
          });
          navigate('/admin/quizzes');
        } else {
          throw new Error('Failed to create quiz');
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
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
          {isEditing ? 'Edit Quiz' : 'Add New Quiz'}
        </h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Loading quiz details...</p>
          </div>
        ) : (
          <QuizForm
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/quizzes')}
            title={isEditing ? 'Edit Quiz' : 'Create New Quiz'}
            description={isEditing ? 'Update quiz details' : 'Add a new quiz to the system'}
            submitLabel={isEditing ? 'Update Quiz' : 'Create Quiz'}
          />
        )}
      </div>
    </div>
  );
};

export default AdminQuizEdit;
