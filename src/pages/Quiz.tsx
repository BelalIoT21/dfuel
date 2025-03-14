
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { machines } from '../utils/data';
import { useToast } from '@/hooks/use-toast';

// Simple mock quiz data
const quizzes = {
  'laser-cutter': [
    {
      question: 'What should you always wear when operating the laser cutter?',
      options: [
        'Headphones',
        'Safety glasses',
        'Gloves',
        'All of the above'
      ],
      correctAnswer: 1
    },
    {
      question: 'What materials should NEVER be cut with the laser cutter?',
      options: [
        'Paper',
        'Wood',
        'PVC or vinyl',
        'Acrylic'
      ],
      correctAnswer: 2
    },
    {
      question: 'What should you do before starting a job?',
      options: [
        'Make sure the exhaust is on',
        'Check if the material is properly secured',
        'Ensure the lens is clean',
        'All of the above'
      ],
      correctAnswer: 3
    }
  ],
  '3d-printer': [
    {
      question: 'What is the maximum temperature of the print bed?',
      options: [
        '50°C',
        '100°C',
        '120°C',
        '200°C'
      ],
      correctAnswer: 2
    },
    {
      question: 'Which material is commonly used in 3D printing?',
      options: [
        'PLA',
        'Gold',
        'Rubber',
        'Concrete'
      ],
      correctAnswer: 0
    },
    {
      question: 'What should you do after a print is complete?',
      options: [
        'Immediately remove the print while hot',
        'Turn off the printer completely',
        'Wait for the bed to cool down before removing the print',
        'Pour water on the print to cool it faster'
      ],
      correctAnswer: 2
    }
  ],
  'cnc-mill': [
    {
      question: 'What safety equipment should you wear when operating the CNC mill?',
      options: [
        'Hearing protection only',
        'Safety glasses only',
        'Safety glasses and hearing protection',
        'No protection is necessary'
      ],
      correctAnswer: 2
    },
    {
      question: 'What should you do before starting the CNC mill?',
      options: [
        'Ensure the workpiece is properly secured',
        'Check that all guards are in place',
        'Verify the tool path is correct',
        'All of the above'
      ],
      correctAnswer: 3
    },
    {
      question: 'What should you never do while the CNC mill is running?',
      options: [
        'Monitor the process',
        'Reach into the working area',
        'Stay nearby',
        'Have emergency stop access'
      ],
      correctAnswer: 1
    }
  ]
};

// Default quiz for any machine not specifically defined
const defaultQuiz = [
  {
    question: 'What is the first step before operating any machine?',
    options: [
      'Turn it on immediately',
      'Check your surroundings and ensure the workspace is clear',
      'Adjust all settings to maximum',
      'Call another person to watch'
    ],
    correctAnswer: 1
  },
  {
    question: 'When should you wear safety glasses?',
    options: [
      'Only when working with wood',
      'Only when specifically instructed',
      'Whenever operating any machinery',
      'Only if you don\'t have good eyesight'
    ],
    correctAnswer: 2
  },
  {
    question: 'What should you do if the machine makes an unusual noise?',
    options: [
      'Ignore it and continue working',
      'Increase the speed to see if it goes away',
      'Stop the machine immediately and report the issue',
      'Hit the machine to make it stop'
    ],
    correctAnswer: 2
  }
];

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(1);
  
  const machine = machines.find(m => m.id === id);
  const quiz = quizzes[id as keyof typeof quizzes] || defaultQuiz;
  
  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Machine not found</h1>
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

  const handleSubmit = () => {
    // Check if all questions are answered
    if (selectedAnswers.length !== quiz.length) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions before submitting."
      });
      return;
    }

    // Calculate score
    let correctAnswers = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quiz[index].correctAnswer) {
        correctAnswers++;
      }
    });

    const passThreshold = Math.ceil(quiz.length * 0.7); // 70% passing threshold
    const passed = correctAnswers >= passThreshold;
    
    setQuizSubmitted(true);

    if (passed) {
      toast({
        title: "Quiz Passed!",
        description: `You got ${correctAnswers} out of ${quiz.length} correct. You can now book the machine.`
      });
      
      // In a real app, update the user's certification in a database
      setTimeout(() => {
        navigate(`/machine/${id}`);
      }, 2000);
    } else {
      if (attempts < 2) {
        toast({
          title: "Quiz Failed",
          description: `You got ${correctAnswers} out of ${quiz.length} correct. You have one more attempt.`,
          variant: "destructive"
        });
        setAttempts(attempts + 1);
        setQuizSubmitted(false);
        setCurrentQuestion(0);
        setSelectedAnswers([]);
      } else {
        toast({
          title: "Quiz Failed",
          description: "You've used all your attempts. Please review the safety course and try again.",
          variant: "destructive"
        });
        
        setTimeout(() => {
          navigate(`/course/${id}`);
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-3xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to={`/machine/${id}`} className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to {machine.name}
          </Link>
          <div className="text-sm text-gray-500">Attempt {attempts} of 2</div>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">{machine.name} Safety Quiz</h1>
        
        <Card>
          <CardContent className="p-6">
            {!quizSubmitted ? (
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Question {currentQuestion + 1} of {quiz.length}</span>
                  <span>{machine.name} Safety Certification</span>
                </div>
                
                <div className="text-xl font-semibold mb-4">
                  {quiz[currentQuestion].question}
                </div>
                
                <RadioGroup
                  value={selectedAnswers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswer(parseInt(value))}
                  className="space-y-3"
                >
                  {quiz[currentQuestion].options.map((option, index) => (
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
                      disabled={selectedAnswers.length !== quiz.length}
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
                <div className="animate-pulse">Processing</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
