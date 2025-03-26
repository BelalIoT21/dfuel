import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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
  const [relatedMachineIds, setRelatedMachineIds] = useState<string[]>([]);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  const isAdminRoute = location.pathname.includes('/admin') || window.location.pathname.includes('/admin');

  useEffect(() => {
    if (!id) return;

    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching quiz data for ID: ${id} (Attempt ${loadAttempts + 1})`);
        
        // First try to get the quiz directly by its ID
        try {
          const quizData = await quizDatabaseService.getQuizById(id);
          
          if (quizData && quizData._id) {
            console.log('Retrieved quiz data directly:', quizData.title);
            setQuiz(quizData);
            
            if (quizData.relatedMachineIds && Array.isArray(quizData.relatedMachineIds) && quizData.relatedMachineIds.length > 0) {
              console.log('Quiz has related machine IDs:', quizData.relatedMachineIds);
              setRelatedMachineIds(quizData.relatedMachineIds.map(id => String(id)));
            }
            
            if (quizData.questions && quizData.questions.length > 0) {
              console.log('Quiz has questions:', quizData.questions.length);
              setQuestions(quizData.questions);
              setAnswers(new Array(quizData.questions.length).fill(-1));
              
              // Try to find a related machine - no special case filtering
              try {
                const allMachines = await machineService.getAllMachines();
                const linkedMachine = allMachines.find(m => 
                  m.linkedQuizId === id || 
                  (quizData.relatedMachineIds && quizData.relatedMachineIds.includes(String(m.id || m._id)))
                );
                
                if (linkedMachine) {
                  console.log('Found linked machine:', linkedMachine.name);
                  setMachine(linkedMachine);
                  const machineIdStr = String(linkedMachine.id || linkedMachine._id);
                  setMachineId(machineIdStr);
                }
              } catch (err) {
                console.error('Error finding linked machine:', err);
              }
              
              setLoading(false);
              return;
            } else {
              console.log('Quiz found but has no questions');
              if (isAdminRoute) {
                setQuestions([]);
                setLoading(false);
                return;
              }
              setError('This quiz has no questions.');
            }
          }
        } catch (err) {
          console.log('Error fetching quiz directly:', err);
        }

        // Try getting all quizzes and finding a match
        try {
          console.log("Fetching all quizzes to find a match");
          const allQuizzes = await quizDatabaseService.getAllQuizzes();
          console.log(`Found ${allQuizzes.length} quizzes total`);
          
          const matchingQuiz = allQuizzes.find(q => 
            String(q._id) === String(id) || 
            String(q.id) === String(id)
          );
          
          if (matchingQuiz) {
            console.log('Found matching quiz in all quizzes list:', matchingQuiz.title);
            setQuiz(matchingQuiz);
            
            if (matchingQuiz.relatedMachineIds && matchingQuiz.relatedMachineIds.length > 0) {
              setRelatedMachineIds(matchingQuiz.relatedMachineIds.map(id => String(id)));
            }
            
            if (matchingQuiz.questions && matchingQuiz.questions.length > 0) {
              setQuestions(matchingQuiz.questions);
              setAnswers(new Array(matchingQuiz.questions.length).fill(-1));
              setLoading(false);
              return;
            } else {
              console.log('Matching quiz has no questions');
              if (isAdminRoute) {
                setQuestions([]);
                setLoading(false);
                return;
              }
              setError('This quiz has no questions.');
            }
          }
        } catch (listErr) {
          console.error('Error fetching all quizzes:', listErr);
        }

        // Try to get a machine and then its linked quiz as last resort
        try {
          const machineData = await machineService.getMachineById(id);
          
          if (machineData && (machineData._id || machineData.id)) {
            console.log('Retrieved machine data:', machineData.name);
            setMachine(machineData);
            const machineIdStr = String(machineData.id || machineData._id || id);
            setMachineId(machineIdStr);

            if (machineData.linkedQuizId) {
              try {
                console.log(`Machine has linked quiz: ${machineData.linkedQuizId}`);
                const quizData = await quizDatabaseService.getQuizById(machineData.linkedQuizId);
                
                if (quizData && quizData.questions && quizData.questions.length > 0) {
                  console.log('Retrieved linked quiz data:', quizData.title);
                  setQuiz(quizData);
                  
                  if (quizData.relatedMachineIds && Array.isArray(quizData.relatedMachineIds) && quizData.relatedMachineIds.length > 0) {
                    console.log('Quiz has related machine IDs:', quizData.relatedMachineIds);
                    setRelatedMachineIds(quizData.relatedMachineIds.map(id => String(id)));
                  }
                  
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
          }
        } catch (err) {
          console.error('Error fetching machine:', err);
        }
        
        // If we've failed to load the quiz multiple times, try an alternative approach
        if (loadAttempts < 2) {
          setLoadAttempts(prev => prev + 1);
          console.log(`Retrying quiz load with different approach (attempt ${loadAttempts + 1})`);
        } else {
          setError('Could not find a quiz with this ID. Please try again or contact an administrator.');
        }
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id, loadAttempts, isAdminRoute]);

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
    
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
    
    const passingThreshold = quiz && quiz.passingScore ? quiz.passingScore : 80;
    const hasPassed = finalScore >= passingThreshold;
    setPassed(hasPassed);
    
    if (hasPassed && user) {
      setCertificationProcessing(true);
      
      let certSuccess = false;
      if (machineId) {
        console.log(`User passed quiz. Adding certification for machine ${machineId}`);
        try {
          certSuccess = await addUserCertification(String(user.id), String(machineId));
          console.log(`Certification for machine ${machineId} result:`, certSuccess);
        } catch (error) {
          console.error(`Error adding certification for machine ${machineId}:`, error);
        }
      }

      if (!certSuccess && relatedMachineIds && relatedMachineIds.length > 0) {
        console.log('Using related machine IDs for certification:', relatedMachineIds);
        
        for (const relatedId of relatedMachineIds) {
          try {
            console.log(`Attempting certification for related machine ${relatedId}`);
            const success = await addUserCertification(String(user.id), relatedId);
            if (success) {
              console.log(`Successfully added certification for related machine ${relatedId}`);
              certSuccess = true;
              if (!machineId) {
                setMachineId(relatedId);
              }
              break;
            }
          } catch (relatedError) {
            console.error(`Error adding certification for related machine ${relatedId}:`, relatedError);
          }
        }
      }
      
      if (certSuccess) {
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
      
      setCertificationProcessing(false);
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
    if (isAdminRoute || user?.isAdmin) {
      console.log('Navigating to admin machines page from admin context');
      navigate('/admin/machines');
      return;
    }
    
    if (machine && (machine.id || machine._id)) {
      const targetId = machine.id || machine._id;
      console.log(`Navigating to machine page for ID: ${targetId}`);
      navigate(`/machine/${targetId}`);
    } else if (machineId) {
      console.log(`Navigating to machine page for saved machineId: ${machineId}`);
      navigate(`/machine/${machineId}`);
    } else if (relatedMachineIds && relatedMachineIds.length > 0) {
      console.log(`Navigating to machine page for related machineId: ${relatedMachineIds[0]}`);
      navigate(`/machine/${relatedMachineIds[0]}`);
    } else {
      console.log(`Fallback navigation to machine page for ID: ${id}`);
      navigate(`/machine/${id}`);
    }
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
            {quiz ? quiz.title : `${machine?.name || 'Quiz'} Certification Quiz`}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          {submitted ? (
            <QuizResult 
              score={score}
              passed={passed}
              passingScore={quiz && quiz.passingScore ? quiz.passingScore : 80}
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
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
                  <p className="text-gray-600">Loading quiz questions...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => setLoadAttempts(prev => prev + 1)}>
                    Try Again
                  </Button>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">This quiz has no questions.</p>
                  {isAdminRoute && (
                    <Button 
                      onClick={() => navigate(`/admin/quizzes/edit/${id}`)}
                      className="mt-4"
                    >
                      Add Questions
                    </Button>
                  )}
                </div>
              ) : (
                questions.map((question, index) => (
                  <QuizQuestion
                    key={question.id || index}
                    question={question}
                    index={index}
                    answer={answers[index]}
                    onAnswerChange={handleAnswerChange}
                    submitted={false}
                  />
                ))
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 pt-4 pb-6">
          {!submitted && !loading && !error && questions.length > 0 && (
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
