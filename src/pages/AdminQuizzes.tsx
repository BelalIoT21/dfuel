
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import { quizDatabaseService } from '@/services/database/quizService';
import { Badge } from '@/components/ui/badge';

const AdminQuizzes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/home');
      return;
    }

    const fetchQuizzes = async () => {
      try {
        const fetchedQuizzes = await quizDatabaseService.getAllQuizzes();
        if (fetchedQuizzes && fetchedQuizzes.length > 0) {
          setQuizzesList(fetchedQuizzes);
        } else {
          setQuizzesList([]);
        }
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setQuizzesList([]);
        setInitialLoadComplete(true);
      }
    };
    
    fetchQuizzes();
  }, [navigate, user?.isAdmin]);

  const handleDeleteQuiz = async (id: string) => {
    try {
      setIsSubmitting(true);
      const success = await quizDatabaseService.deleteQuiz(id);
      
      if (!success) {
        throw new Error("Failed to delete quiz");
      }
      
      toast({
        title: "Quiz Deleted",
        description: "The quiz has been deleted successfully."
      });
      
      setQuizzesList(prev => prev.filter(q => q._id !== id && q.id !== id));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error Deleting Quiz",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuizzes = quizzesList
    .filter(quiz =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6">
          <BackToAdminButton />
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Quiz Management</h1>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="w-full md:w-1/3">
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Button onClick={() => navigate('/admin/quizzes/new')}>Add New Quiz</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>All Quizzes</CardTitle>
            <CardDescription>Manage and monitor all quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!initialLoadComplete ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading quizzes...</p>
                </div>
              ) : filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => (
                  <div key={quiz._id || quiz.id} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-0">
                    <div className="flex-shrink-0 w-full md:w-1/4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={quiz.imageUrl || '/placeholder.svg'}
                          alt={quiz.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {quiz.category}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          {quiz.difficulty || 'Beginner'}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {quiz.questions?.length || 0} Questions
                        </Badge>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Pass: {quiz.passingScore}%
                        </Badge>
                        {quiz.relatedCourseId && (
                          <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100">
                            Has Course
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/quiz/${quiz._id || quiz.id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/quizzes/edit/${quiz._id || quiz.id}`}>Edit</Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteQuiz(quiz._id || quiz.id)}
                          disabled={isSubmitting}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? (
                    <>
                      <p>No quizzes found matching your search criteria.</p>
                      <Button 
                        className="mt-4" 
                        variant="outline" 
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>No quizzes have been created yet.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/admin/quizzes/new')}
                      >
                        Create Your First Quiz
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminQuizzes;
