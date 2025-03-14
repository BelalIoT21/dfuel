
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Check, X, Loader2 } from 'lucide-react';
import { machines, quizzes, defaultQuiz } from '../utils/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, addCertification, completeSafetyCourse } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [certificationAdded, setCertificationAdded] = useState(false);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [machine, setMachine] = useState<any>(null);
  
  // Initialize quiz data
  useEffect(() => {
    try {
      if (!id) {
        toast({
          title: "Error",
          description: "Quiz ID not provided",
          variant: "destructive"
        });
        navigate('/home');
        return;
      }

      const foundMachine = machines.find(m => m.id === id);
      if (!foundMachine) {
        toast({
          title: "Error",
          description: "Machine not found",
          variant: "destructive"
        });
        navigate('/home');
        return;
      }
      
      setMachine(foundMachine);
      
      // Set quiz questions
      const quizQuestions = id && quizzes[id] ? quizzes[id].questions : defaultQuiz;
      setQuiz(quizQuestions);
      
      // Initialize answers array with undefined values
      setSelectedAnswers(new Array(quizQuestions.length).fill(undefined));
      
      setLoading(false);
    } catch (error) {
      console.error("Error initializing quiz:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz data",
        variant: "destructive"
      });
      navigate('/home');
    }
  }, [id, navigate, toast]);
  
  // If loading or data not ready, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h1 className="text-2xl font-bold">Loading Quiz...</h1>
        </div>
      </div>
    );
  }

  // If machine not found after loading, show error
  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz not found</h1>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAnswer = (index: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = index;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Check if any questions are unanswered
      const unansweredIndex = selectedAnswers.findIndex(answer => answer === undefined);
      
      if (unansweredIndex !== -1) {
        setCurrentQuestion(unansweredIndex);
        toast({
          title: "Incomplete",
          description: `Please answer question ${unansweredIndex + 1} before submitting.`,
          variant: "destructive"
        });
        return;
      }

      setQuizSubmitted(true);
      
      // Calculate score
      let correct = 0;
      selectedAnswers.forEach((answer, index) => {
        if (answer === quiz[index].correctAnswer) {
          correct++;
        }
      });
      setCorrectAnswers(correct);

      const passThreshold = Math.ceil(quiz.length * 0.7);
      const passed = correct >= passThreshold;
      
      setShowResults(true);

      // If passed, update certifications or safety courses
      if (passed && !certificationAdded && id && user) {
        try {
          let success = false;
          
          // Handle differently based on if it's a safety course or machine certification
          if (id === 'safety-course') {
            success = await completeSafetyCourse(id);
            setCertificationAdded(success);
            
            if (success) {
              toast({
                title: "Safety Course Completed!",
                description: `You got ${correct} out of ${quiz.length} correct. You can now access all machines.`
              });
            } else {
              toast({
                title: "Quiz Passed!",
                description: `You got ${correct} out of ${quiz.length} correct, but there was an issue recording your completion.`,
                variant: "destructive"
              });
            }
          } else {
            success = await addCertification(id);
            setCertificationAdded(success);
            
            if (success) {
              toast({
                title: "Quiz Passed!",
                description: `You got ${correct} out of ${quiz.length} correct. You are now certified to use this machine.`
              });
            } else {
              toast({
                title: "Quiz Passed!",
                description: `You got ${correct} out of ${quiz.length} correct, but there was an issue adding your certification.`,
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error("Error updating certification status:", error);
          toast({
            title: "Quiz Passed!",
            description: `You got ${correct} out of ${quiz.length} correct, but there was an error processing your certification.`,
            variant: "destructive"
          });
        }
      } else if (!passed) {
        if (attempts < 2) {
          toast({
            title: "Quiz Failed",
            description: `You got ${correct} out of ${quiz.length} correct. You have one more attempt.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Quiz Failed",
            description: "You've used all your attempts. Please review the safety course and try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your quiz. Please try again.",
        variant: "destructive"
      });
      setQuizSubmitted(false);
    }
  };

  const handleRetry = () => {
    setAttempts(attempts + 1);
    setQuizSubmitted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quiz.length).fill(undefined));
  };

  const handleReturnToCourse = () => {
    navigate(`/course/${id}`);
  };

  const handleReturnToMachine = () => {
    navigate(`/machine/${id}`);
  };

  const progress = Math.round(((currentQuestion + 1) / quiz.length) * 100);

  // Show different title based on if it's a safety course or machine certification
  const quizTitle = id === 'safety-course' 
    ? "General Safety Course Quiz" 
    : `${machine.name} Safety Quiz`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-3xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to={id === 'safety-course' ? '/home' : `/machine/${id}`} className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to {id === 'safety-course' ? 'Home' : machine.name}
          </Link>
          <div className="text-sm text-gray-500">Attempt {attempts} of 2</div>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">{quizTitle}</h1>
        
        {!showResults ? (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <CardTitle>Question {currentQuestion + 1} of {quiz.length}</CardTitle>
                <CardDescription>
                  {id === 'safety-course' ? 'Safety Course Certification' : `${machine.name} Certification`}
                </CardDescription>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="p-6">
              {!quizSubmitted ? (
                <div className="space-y-6">
                  <div className="text-xl font-semibold mb-4">
                    {quiz[currentQuestion].question}
                  </div>
                  
                  <RadioGroup
                    value={selectedAnswers[currentQuestion]?.toString()}
                    onValueChange={(value) => handleAnswer(parseInt(value))}
                    className="space-y-3"
                  >
                    {quiz[currentQuestion].options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>
                    
                    {currentQuestion < quiz.length - 1 ? (
                      <Button 
                        onClick={handleNext}
                        disabled={selectedAnswers[currentQuestion] === undefined}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleSubmit}
                        disabled={selectedAnswers[currentQuestion] === undefined}
                      >
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-2xl font-bold mb-2">Quiz Submitted</div>
                  <p className="text-gray-600 mb-6">Your results are being processed...</p>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>
                You answered {correctAnswers} out of {quiz.length} questions correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-4">
                  {correctAnswers >= Math.ceil(quiz.length * 0.7) ? (
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 text-green-600 mb-4">
                        <Check className="h-12 w-12" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-600">Congratulations!</h3>
                      <p className="text-gray-600">
                        You have passed the quiz and are now {id === 'safety-course' 
                          ? 'certified to access all machines' 
                          : `certified to use the ${machine.name}`}.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-red-100 text-red-600 mb-4">
                        <X className="h-12 w-12" />
                      </div>
                      <h3 className="text-2xl font-bold text-red-600">Not Quite There</h3>
                      <p className="text-gray-600">
                        You need to score at least 70% to pass the quiz.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Review Your Answers</h3>
                  {quiz.map((question: any, index: number) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex items-start gap-2">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedAnswers[index] === question.correctAnswer 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {selectedAnswers[index] === question.correctAnswer 
                            ? <Check className="h-4 w-4" /> 
                            : <X className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium mb-1">{question.question}</p>
                          <p className="text-sm text-gray-600">Your answer: {question.options[selectedAnswers[index]]}</p>
                          {selectedAnswers[index] !== question.correctAnswer && (
                            <p className="text-sm text-green-600">Correct answer: {question.options[question.correctAnswer]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  {correctAnswers >= Math.ceil(quiz.length * 0.7) ? (
                    <Button onClick={id === 'safety-course' ? () => navigate('/home') : handleReturnToMachine}>
                      {id === 'safety-course' ? 'Return to Home' : 'Return to Machine Page'}
                    </Button>
                  ) : attempts < 2 ? (
                    <>
                      <Button variant="outline" onClick={handleReturnToCourse}>
                        Review Course
                      </Button>
                      <Button onClick={handleRetry}>
                        Retry Quiz
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleReturnToCourse}>
                      Return to Course
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Quiz;
