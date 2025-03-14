
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { SafetyAlert } from '@/components/home/SafetyAlert';
import { PageHeader } from '@/components/home/PageHeader';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import { toast } from '@/components/ui/use-toast';

// Define a type for quiz questions
type Question = {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
};

// Sample safety course quiz questions
const safetyQuizQuestions: Question[] = [
  {
    id: 1,
    text: "What should you always do before operating machinery?",
    options: [
      { id: "a", text: "Take a picture for social media" },
      { id: "b", text: "Put on appropriate PPE" },
      { id: "c", text: "Call a friend" },
      { id: "d", text: "Turn up the music" }
    ],
    correctAnswer: "b"
  },
  {
    id: 2,
    text: "When should you report equipment malfunctions?",
    options: [
      { id: "a", text: "Only if they cause an injury" },
      { id: "b", text: "At the end of the week" },
      { id: "c", text: "Immediately" },
      { id: "d", text: "Never, try to fix it yourself" }
    ],
    correctAnswer: "c"
  },
  {
    id: 3,
    text: "What should you do with loose clothing before operating machinery?",
    options: [
      { id: "a", text: "Secure it properly" },
      { id: "b", text: "Nothing, it's fine" },
      { id: "c", text: "Make it looser for comfort" },
      { id: "d", text: "Cut it off" }
    ],
    correctAnswer: "a"
  }
];

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addCertification } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Load quiz questions based on the ID
    try {
      if (!id) {
        setError("Quiz ID is missing");
        setLoading(false);
        return;
      }

      // We'll use our sample questions for the safety course
      setQuestions(safetyQuizQuestions);
      setLoading(false);
    } catch (err) {
      console.error("Error loading quiz:", err);
      setError("Failed to load quiz questions");
      setLoading(false);
    }
  }, [id]);

  const handleAnswerChange = (questionId: number, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmit = async () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    setScore(scorePercentage);
    setSubmitted(true);

    // If score is passing (e.g., 70% or higher), grant certification
    if (scorePercentage >= 70 && id) {
      try {
        const success = await addCertification(id);
        if (success) {
          toast({
            title: "Certification Granted",
            description: `You scored ${scorePercentage}% and earned certification!`,
          });
        } else {
          toast({
            title: "Certification Error",
            description: "There was an issue granting your certification.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Certification error:", error);
        toast({
          title: "Certification Error",
          description: "There was an issue granting your certification.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <SafetyAlert 
          title="Error Loading Quiz" 
          description={error} 
          action={{
            label: "Go Home",
            onClick: () => navigate("/home")
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader 
        title="Safety Quiz" 
        description="Test your knowledge of safety procedures"
        backHref={`/course/${id}`}
      />
      
      <div className="mt-8">
        {submitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>
                You scored {score}% ({score >= 70 ? 'Pass' : 'Fail'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {score >= 70 ? (
                <div className="text-center p-4 bg-green-50 rounded-md text-green-800">
                  <h3 className="font-bold text-xl mb-2">Congratulations!</h3>
                  <p>You've passed the safety quiz and received certification.</p>
                </div>
              ) : (
                <div className="text-center p-4 bg-red-50 rounded-md text-red-800">
                  <h3 className="font-bold text-xl mb-2">Not quite there</h3>
                  <p>You need to score at least 70% to pass. Please try again.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              {score < 70 && (
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  Retry Quiz
                </Button>
              )}
              <Button 
                onClick={() => navigate('/home')} 
                className="w-full"
              >
                Return Home
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Safety Quiz</CardTitle>
              <CardDescription>
                Answer all questions to complete the quiz. You need 70% to pass.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <h3 className="font-medium">
                    {question.id}. {question.text}
                  </h3>
                  <RadioGroup 
                    value={answers[question.id]} 
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                  >
                    {question.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`q${question.id}-${option.id}`} />
                        <Label htmlFor={`q${question.id}-${option.id}`}>{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit} 
                disabled={questions.length !== Object.keys(answers).length}
                className="w-full"
              >
                Submit Answers
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Quiz;
