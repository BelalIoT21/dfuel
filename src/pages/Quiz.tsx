
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { machineService } from '@/services/machineService';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { quizDatabaseService } from '@/services/database/quizService';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizResult from '@/components/quiz/QuizResult';
import { addUserCertification } from '@/components/quiz/CertificationService';

interface Question {
  id?: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [machine, setMachine] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [machineId, setMachineId] = useState<string | null>(null);
  const [certificationProcessing, setCertificationProcessing] = useState(false);
  const [certificationAdded, setCertificationAdded] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching quiz data for ID: ${id}`);
        
        // Try to get the quiz directly first
        try {
          const quizData = await quizDatabaseService.getQuizById(id);
          
          if (quizData && quizData._id) {
            console.log('Retrieved quiz data directly:', quizData);
            setQuiz(quizData);
            
            if (quizData.questions && quizData.questions.length > 0) {
              setQuestions(quizData.questions);
              setAnswers(new Array(quizData.questions.length).fill(-1));
              
              // Try to find the machine that links to this quiz
              try {
                const allMachines = await machineService.getAllMachines();
                const linkedMachine = allMachines.find(m => m.linkedQuizId === id);
                if (linkedMachine) {
                  console.log('Found linked machine:', linkedMachine);
                  setMachine(linkedMachine);
                  setMachineId(linkedMachine.id || linkedMachine._id);
                  console.log('Set machine ID to:', linkedMachine.id || linkedMachine._id);
                }
              } catch (err) {
                console.error('Error finding linked machine:', err);
                // Continue anyway since we have the quiz
              }
              
              setLoading(false);
              return;
            } else {
              console.log('Quiz found but has no questions');
              setError('This quiz has no questions.');
            }
          }
        } catch (err) {
          console.log('Error fetching quiz directly:', err);
          // Continue with machine lookup
        }
        
        // If not a direct quiz ID, try to get the machine and its linked quiz
        try {
          const machineData = await machineService.getMachineById(id);
          
          if (machineData && machineData._id) {
            console.log('Retrieved machine data:', machineData);
            setMachine(machineData);
            setMachineId(machineData.id || machineData._id || id);
            console.log('Set machine ID to:', machineData.id || machineData._id || id);

            // Check if the machine has a linked quiz
            if (machineData.linkedQuizId) {
              try {
                console.log(`Machine has linked quiz: ${machineData.linkedQuizId}`);
                const quizData = await quizDatabaseService.getQuizById(machineData.linkedQuizId);
                
                if (quizData && quizData.questions && quizData.questions.length > 0) {
                  console.log('Retrieved linked quiz data:', quizData);
                  setQuiz(quizData);
                  setQuestions(quizData.questions);
                  setAnswers(new Array(quizData.questions.length).fill(-1));
                  setLoading(false);
                  return;
                } else {
                  console.log('Linked quiz has no questions or could not be loaded');
                  setError('This machine has a linked quiz, but it has no questions.');
                }
              } catch (err) {
                console.error('Error fetching linked quiz:', err);
                setError('Error loading the quiz for this machine.');
              }
            } else {
              console.log('Machine has no linked quiz ID');
              setError('This machine does not have a quiz associated with it.');
            }
          } else {
            console.log('Machine not found or incomplete data');
            setError('Could not find a machine or quiz with this ID.');
          }
        } catch (err) {
          console.error('Error fetching machine:', err);
          setError('Could not find a machine or quiz with this ID.');
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id]);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const isQuizComplete = () => {
    return answers.every(answer => answer !== -1);
  };

  const handleSubmit = async () => {
    if (!isQuizComplete()) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate score
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
    
    // Determine if passed (use quiz passing score if available, otherwise 80%)
    const passingThreshold = quiz ? quiz.passingScore : 80;
    const hasPassed = finalScore >= passingThreshold;
    setPassed(hasPassed);
    
    // If passed, grant certification
    if (hasPassed && user && machineId) {
      setCertificationProcessing(true);
      
      console.log(`User passed quiz. Adding certification for user ${user.id} and machine ${machineId}`);
      
      try {
        const success = await addUserCertification(user.id, machineId);
        
        if (success) {
          console.log('Successfully added certification');
          setCertificationAdded(true);
          toast({
            title: "Certification Granted",
            description: "You have been certified for this machine!",
            variant: "default"
          });
        } else {
          console.error('All certification attempts failed');
          toast({
            title: "Certification Issue",
            description: "Your quiz was passed, but there was an issue adding the certification. Please contact an administrator.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error adding certification:', error);
        toast({
          title: "Certification Error",
          description: "An error occurred while adding your certification.",
          variant: "destructive"
        });
      } finally {
        setCertificationProcessing(false);
      }
    }
    
    setSubmitted(true);
  };

  const handleRetakeQuiz = () => {
    setAnswers(new Array(questions.length).fill(-1));
    setSubmitted(false);
    setScore(0);
    setPassed(false);
  };

  const handleViewMachine = () => {
    // Navigate to the correct machine page, not dashboard
    const targetId = machineId || (machine && (machine.id || machine._id));
    
    if (!targetId) {
      toast({
        title: "Navigation Error",
        description: "Could not determine which machine page to return to",
        variant: "destructive"
      });
      // Navigate to machines page if we can't find the specific machine
      navigate('/machines');
      return;
    }
    
    console.log(`Navigating to machine page for ID: ${targetId}`);
    navigate(`/machine/${targetId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading quiz questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/machines')}>
            Return to Machines
          </Button>
        </div>
      </div>
    );
  }

  // If we have no questions to display, show an error
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">No Questions Available</h1>
          <p className="text-gray-600 mb-4">This quiz has no questions configured.</p>
          <Button onClick={() => navigate('/machines')}>
            Return to Machines
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Button
        variant="ghost"
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="shadow-lg border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
          <CardTitle className="text-2xl text-purple-800">
            {quiz ? quiz.title : `${machine?.name} Certification Quiz`}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          {submitted ? (
            <QuizResult 
              score={score}
              passed={passed}
              passingScore={quiz ? quiz.passingScore : 80}
              onRetake={handleRetakeQuiz}
              onViewMachine={handleViewMachine}
              certificationProcessing={certificationProcessing}
              certificationAdded={certificationAdded}
            />
          ) : (
            <div className="space-y-8">
              {quiz && quiz.description && (
                <div className="mb-6 text-gray-600 border-b pb-4">
                  {quiz.description}
                </div>
              )}
              
              {questions.map((question, index) => (
                <QuizQuestion
                  key={question.id || index}
                  question={question}
                  index={index}
                  answer={answers[index]}
                  onAnswerChange={handleAnswerChange}
                  submitted={false}
                />
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 pt-4 pb-6">
          {!submitted && (
            <Button 
              onClick={handleSubmit}
              disabled={!isQuizComplete()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Submit Answers
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Quiz;
