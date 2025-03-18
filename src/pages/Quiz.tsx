import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Trophy, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { quizzes, defaultQuiz } from '../utils/data';
import { apiService } from '../services/apiService';
import { certificationService } from '../services/certificationService';

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isPassing, setIsPassing] = useState(false);
  const [certificateAwarded, setCertificateAwarded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSelectedAnswer, setCurrentSelectedAnswer] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadQuiz = async () => {
      try {
        setLoading(true);
        
        let quiz = null;
        
        try {
          const response = await apiService.getQuiz(id || '');
          if (response.data) {
            quiz = response.data;
          }
        } catch (apiError) {
          console.error('Error fetching quiz from API:', apiError);
        }
        
        if (!quiz) {
          quiz = quizzes[id || ''];
        }
        
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
          console.log('No quiz found, using default quiz');
          quiz = {
            id: id,
            machineId: id,
            questions: defaultQuiz
          };
        }
        
        setQuizData(quiz);
        setSelectedAnswers(new Array(quiz.questions.length).fill(undefined));
      } catch (error) {
        console.error('Error loading quiz:', error);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id, user, navigate]);

  useEffect(() => {
    if (selectedAnswers && selectedAnswers.length > currentQuestion) {
      setCurrentSelectedAnswer(selectedAnswers[currentQuestion]);
    } else {
      setCurrentSelectedAnswer(undefined);
    }
  }, [currentQuestion, selectedAnswers]);

  const handleSelectAnswer = (index: number) => {
    setCurrentSelectedAnswer(index);
    
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = index;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNext = () => {
    if (currentSelectedAnswer !== undefined) {
      const newSelectedAnswers = [...selectedAnswers];
      newSelectedAnswers[currentQuestion] = currentSelectedAnswer;
      setSelectedAnswers(newSelectedAnswers);
    }
    
    setCurrentQuestion(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentSelectedAnswer !== undefined) {
      const newSelectedAnswers = [...selectedAnswers];
      newSelectedAnswers[currentQuestion] = currentSelectedAnswer;
      setSelectedAnswers(newSelectedAnswers);
    }
    
    setCurrentQuestion(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (currentSelectedAnswer !== undefined) {
      const newSelectedAnswers = [...selectedAnswers];
      newSelectedAnswers[currentQuestion] = currentSelectedAnswer;
      setSelectedAnswers(newSelectedAnswers);
    }
    
    let correctCount = 0;
    for (let i = 0; i < quizData.questions.length; i++) {
      if (selectedAnswers[i] === quizData.questions[i].correctAnswer) {
        correctCount++;
      }
    }
    
    const calculatedScore = Math.round((correctCount / quizData.questions.length) * 100);
    const passed = calculatedScore >= 70;
    
    setScore(calculatedScore);
    setIsPassing(passed);
    setQuizCompleted(true);
    
    if (passed && user) {
      try {
        const success = await certificationService.addCertification(user.id, id || '');
        setCertificateAwarded(success);
        
        if (success) {
          toast({
            title: 'Certification Awarded',
            description: 'You have been certified for this machine!',
          });
        }
      } catch (error) {
        console.error('Error adding certification:', error);
        toast({
          title: 'Error',
          description: 'Failed to award certification. Please contact support.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleReturnToMachine = () => {
    navigate(`/machine/${id}`);
  };

  const handleReturnToCourse = () => {
    navigate(`/course/${id}`);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quizData.questions.length).fill(undefined));
    setCurrentSelectedAnswer(undefined);
    setQuizCompleted(false);
    setScore(0);
    setIsPassing(false);
    setCertificateAwarded(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-purple-700">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Error Loading Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleReturnToMachine} className="bg-purple-600 hover:bg-purple-700">
              Return to Machine
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!quizData || !quizData.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Quiz Not Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">No quiz is available for this machine at the moment. Please check back later.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleReturnToMachine} className="bg-purple-600 hover:bg-purple-700">
              Return to Machine
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 p-4 md:p-6">
        <div className="max-w-3xl mx-auto page-transition">
          <Button 
            variant="ghost" 
            onClick={handleReturnToMachine}
            className="mb-6 flex items-center text-gray-600"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Return to Machine
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className={`h-6 w-6 ${isPassing ? 'text-green-500' : 'text-red-500'}`} />
                Quiz Results
              </CardTitle>
              <CardDescription>
                {quizData.title || `Safety Quiz for Machine #${id}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center rounded-full h-20 w-20 mb-4 ${
                  isPassing ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {isPassing ? (
                    <CheckCircle className="h-10 w-10" />
                  ) : (
                    <XCircle className="h-10 w-10" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">
                  {isPassing ? 'Congratulations!' : 'Not Quite There'}
                </h2>
                
                <p className="text-gray-600 mb-4">
                  {isPassing 
                    ? 'You passed the quiz and are now certified to use this machine.' 
                    : 'You did not pass the quiz. Review the course material and try again.'}
                </p>
                
                <div className="text-4xl font-bold mb-2">
                  {score}%
                </div>
                
                <p className="text-sm text-gray-500">
                  Passing score: 70%
                </p>
              </div>
              
              <Separator className="my-6" />
              
              {isPassing ? (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Certification Awarded</AlertTitle>
                  <AlertDescription>
                    You have demonstrated proficiency with this machine and have been awarded certification.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Review Suggested</AlertTitle>
                  <AlertDescription>
                    We recommend reviewing the course material before attempting the quiz again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              {!isPassing && (
                <>
                  <Button variant="outline" onClick={handleReturnToCourse}>
                    Review Course
                  </Button>
                  <Button onClick={handleRetry} className="bg-purple-600 hover:bg-purple-700">
                    Retry Quiz
                  </Button>
                </>
              )}
              
              <Button 
                onClick={handleReturnToMachine} 
                className={isPassing ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-600 hover:bg-purple-700"}
              >
                Return to Machine
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuizQuestion = quizData?.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto page-transition">
        <Button 
          variant="ghost" 
          onClick={handleReturnToMachine}
          className="mb-6 flex items-center text-gray-600"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Return to Machine
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Safety Quiz</CardTitle>
            <CardDescription>
              {quizData?.title || `Quiz for Machine #${id}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {quizData?.questions.length}</span>
                <span className="text-sm font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {Math.round(((currentQuestion + 1) / quizData?.questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${((currentQuestion + 1) / quizData?.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-medium">{currentQuizQuestion?.question}</h3>
              
              <RadioGroup
                value={currentSelectedAnswer !== undefined ? currentSelectedAnswer.toString() : ""}
                className="space-y-3"
                onValueChange={(value) => handleSelectAnswer(parseInt(value, 10))}
              >
                {currentQuizQuestion?.options.map((option: string, index: number) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all duration-200 
                      ${currentSelectedAnswer === index 
                        ? 'bg-purple-100 border-purple-300 shadow-sm' 
                        : 'hover:bg-gray-50 border-gray-200'}`}
                  >
                    <RadioGroupItem 
                      value={index.toString()} 
                      id={`option-${index}`}
                      className={currentSelectedAnswer === index ? 'text-purple-600' : ''}
                    />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className={`flex-grow cursor-pointer font-medium ${currentSelectedAnswer === index ? 'text-purple-900' : 'text-gray-700'}`}
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <div>
              {currentQuestion < quizData?.questions.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!selectedAnswers.every(answer => answer !== undefined)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
