
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { machineService } from '@/services/machineService';
import { certificationService } from '@/services/certificationService';
import { ChevronLeft, Loader2, CheckCircle, XCircle, Award } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { quizDatabaseService } from '@/services/database/quizService';

interface Question {
  id?: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const defaultSafetyQuestions: Question[] = [
  {
    id: 1,
    question: "What should you always wear when operating machinery?",
    options: [
      "Jewelry and loose clothing",
      "Appropriate Personal Protective Equipment (PPE)",
      "Headphones",
      "Nothing special is required"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    text: "What should you do before operating a machine?",
    options: [
      "Check your email",
      "Have a snack",
      "Ensure you are certified and the machine is in working order",
      "Call a friend"
    ],
    correctAnswer: 2
  },
  {
    id: 3,
    text: "What should you do if you notice a machine is malfunctioning?",
    options: [
      "Try to fix it yourself",
      "Ignore it and continue working",
      "Use it carefully",
      "Report it immediately and do not use it"
    ],
    correctAnswer: 3
  },
  {
    id: 4,
    text: "Where should food and drinks be kept?",
    options: [
      "Next to the machine while working",
      "Away from machine work areas",
      "Anywhere convenient",
      "On top of electronic equipment"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    text: "What should you do after finishing with a machine?",
    options: [
      "Leave it as is for the next person",
      "Turn it off only if it's making noise",
      "Clean up, return tools, and follow proper shutdown procedures",
      "Lock the room"
    ],
    correctAnswer: 2
  }
];

const generateMachineQuestions = (machine: any): Question[] => {
  const machineName = machine.name || 'this machine';
  
  return [
    {
      id: 1,
      question: `What should you always do before operating the ${machineName}?`,
      options: [
        "Check your phone",
        "Ensure the work area is clean and the machine is in working order",
        "Play music",
        "Nothing special is required"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      text: `When using the ${machineName}, what PPE is typically required?`,
      options: [
        "No PPE is necessary",
        "Only gloves",
        "Safety glasses at minimum, and other PPE as specified",
        "Headphones"
      ],
      correctAnswer: 2
    },
    {
      id: 3,
      text: "What should you do if the machine makes an unusual noise?",
      options: [
        "Increase the speed to overcome the noise",
        "Ignore it if the machine still works",
        "Stop immediately, turn off the machine, and report the issue",
        "Hit the machine gently to fix it"
      ],
      correctAnswer: 2
    },
    {
      id: 4,
      text: "When is it appropriate to leave a machine running unattended?",
      options: [
        "When you need to go to lunch",
        "When you need to use the bathroom",
        "When another person is nearby",
        "Never leave a machine running unattended"
      ],
      correctAnswer: 3
    },
    {
      id: 5,
      text: `What is the proper procedure when you've finished using the ${machineName}?`,
      options: [
        "Turn it off and leave immediately",
        "Clean the machine, return tools, and follow shutdown procedures",
        "Let the next user deal with cleanup",
        "Just log out of your account"
      ],
      correctAnswer: 1
    }
  ];
};

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

  useEffect(() => {
    if (!id) return;

    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching quiz data for machine ID: ${id}`);
        
        // First, get the machine
        const machineData = await machineService.getMachineById(id);
        
        if (!machineData) {
          console.error(`Machine with ID ${id} not found`);
          setError('Quiz not found');
          setLoading(false);
          return;
        }
        
        console.log('Retrieved machine data:', machineData);
        setMachine(machineData);

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
              console.log('Linked quiz has no questions, falling back to generated questions');
            }
          } catch (err) {
            console.error('Error fetching linked quiz:', err);
            // Continue with generated questions if there's an error
          }
        }
        
        // Generate default questions based on machine type if no linked quiz
        if (id === '6') {
          // Safety course
          setQuestions(defaultSafetyQuestions);
        } else {
          // Regular machine quiz
          setQuestions(generateMachineQuestions(machineData));
        }
        
        // Initialize answers array
        setAnswers(new Array(5).fill(-1));
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz');
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

  const handleSubmit = () => {
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
    if (hasPassed && user && id) {
      certificationService.addCertification(user.id, id)
        .then(success => {
          if (success) {
            console.log(`Certification added for user ${user.id} and machine ${id}`);
          } else {
            console.error(`Failed to add certification for user ${user.id} and machine ${id}`);
          }
        })
        .catch(error => {
          console.error('Error adding certification:', error);
        });
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
    if (!id) return;
    
    navigate(`/machine/${id}`);
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
          <Button onClick={() => navigate('/home')}>
            Return to Home
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
            <div className="space-y-6">
              <div className="text-center p-4">
                {passed ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <h2 className="text-2xl font-bold text-green-600">Congratulations!</h2>
                    <p className="text-lg">You passed the quiz with a score of {score.toFixed(0)}%</p>
                    <div className="flex items-center gap-2 text-green-600 mt-4 bg-green-50 p-3 px-4 rounded-md">
                      <Award className="h-5 w-5" />
                      <span className="font-medium">You are now certified to use this machine</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <XCircle className="h-16 w-16 text-red-500" />
                    <h2 className="text-2xl font-bold text-red-600">Not Quite There</h2>
                    <p className="text-lg">Your score of {score.toFixed(0)}% didn't meet the {quiz ? quiz.passingScore : 80}% passing requirement</p>
                    <p className="text-gray-500 mt-2">Review the course material and try again</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 mt-8">
                {questions.map((question, index) => (
                  <div key={question.id || index} className="border rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 flex-shrink-0 ${
                        answers[index] === question.correctAnswer 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {answers[index] === question.correctAnswer 
                          ? <CheckCircle className="h-5 w-5" /> 
                          : <XCircle className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        <ul className="mt-2 space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <li 
                              key={optionIndex} 
                              className={`text-sm py-1 px-2 rounded ${
                                optionIndex === question.correctAnswer 
                                  ? 'bg-green-100 text-green-800' 
                                  : optionIndex === answers[index] 
                                    ? 'bg-red-100 text-red-800' 
                                    : ''
                              }`}
                            >
                              {option}
                            </li>
                          ))}
                        </ul>
                        {question.explanation && (
                          <div className="mt-2 text-sm bg-blue-50 p-2 rounded text-blue-700">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {quiz && quiz.description && (
                <div className="mb-6 text-gray-600 border-b pb-4">
                  {quiz.description}
                </div>
              )}
              
              {questions.map((question, index) => (
                <div key={question.id || index} className="border rounded-md p-4">
                  <p className="font-medium mb-4">{question.question}</p>
                  <RadioGroup 
                    value={answers[index] >= 0 ? answers[index].toString() : ""} 
                    onValueChange={(value) => handleAnswerChange(index, parseInt(value))}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2 my-2">
                        <RadioGroupItem value={optionIndex.toString()} id={`q${index}-o${optionIndex}`} />
                        <Label htmlFor={`q${index}-o${optionIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 pt-4 pb-6">
          {submitted ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleRetakeQuiz}
              >
                Retake Quiz
              </Button>
              <Button 
                onClick={handleViewMachine}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Return to Machine Page
              </Button>
            </>
          ) : (
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
