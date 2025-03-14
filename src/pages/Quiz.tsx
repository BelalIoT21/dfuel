
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { machines, quizzes } from '../utils/data';
import { useToast } from '@/hooks/use-toast';

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  const machine = machines.find(m => m.id === id);
  const quiz = id ? quizzes[id] : undefined;
  
  if (!machine || !quiz) {
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

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const newScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(newScore);
    setQuizCompleted(true);
    
    if (newScore >= 70) {
      // In a real app, this would call an API to mark the quiz as passed
      toast({
        title: "Quiz passed!",
        description: `You scored ${newScore}%. You can now book the machine.`,
      });
    } else {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      if (newAttemptCount >= 2) {
        toast({
          title: "Quiz failed",
          description: "Please review the course material and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Quiz failed",
          description: `You scored ${newScore}%. You have ${2 - newAttemptCount} attempt(s) remaining.`,
          variant: "destructive",
        });
      }
    }
    
    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setQuizCompleted(false);
  };

  const question = quiz.questions[currentQuestion];

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
        <div className="max-w-md mx-auto page-transition">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className={`text-5xl font-bold ${score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                  {score}%
                </div>
                <p className="mt-2 text-gray-600">
                  {score >= 70 
                    ? "Congratulations! You have passed the safety quiz." 
                    : "Unfortunately, you did not pass the safety quiz."}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4 justify-center">
              {score >= 70 ? (
                <>
                  <Button onClick={() => navigate(`/booking/${id}`)}>
                    Book Machine
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/machine/${id}`)}>
                    Return to Machine
                  </Button>
                </>
              ) : (
                <>
                  {attemptCount < 2 ? (
                    <Button onClick={handleRetry}>
                      Try Again
                    </Button>
                  ) : (
                    <Button onClick={() => navigate(`/course/${id}`)}>
                      Review Course
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => navigate(`/machine/${id}`)}>
                    Return to Machine
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-2xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to={`/machine/${id}`} className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to {machine.name}
          </Link>
          <div className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedAnswers[currentQuestion]?.toString()} 
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={selectedAnswers.length !== quiz.questions.length || 
                  selectedAnswers.some(a => a === undefined) ||
                  isSubmitting}
              >
                Submit Quiz
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
