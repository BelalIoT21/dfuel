
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { machines } from '../utils/data';
import { useAuth } from '../context/AuthContext';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const machine = machines.find(m => m.id === id);
  
  const [isCourseCompleted, setIsCourseCompleted] = useState(() => {
    // For development, let's check localStorage for course completion status
    const completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
    return completedCourses.includes(id);
  });
  
  const [isQuizPassed, setIsQuizPassed] = useState(() => {
    // For development, let's check localStorage for quiz completion status
    const passedQuizzes = JSON.parse(localStorage.getItem('passedQuizzes') || '[]');
    return passedQuizzes.includes(id);
  });
  
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
  
  // Listen for course completion event (for development purposes)
  if (!isCourseCompleted) {
    window.addEventListener('coursecomplete', (e: CustomEvent) => {
      if (e.detail.machineId === id) {
        setIsCourseCompleted(true);
        const completedCourses = JSON.parse(localStorage.getItem('completedCourses') || '[]');
        if (!completedCourses.includes(id)) {
          completedCourses.push(id);
          localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
        }
      }
    });
  }
  
  // Listen for quiz pass event (for development purposes)
  if (!isQuizPassed) {
    window.addEventListener('quizpass', (e: CustomEvent) => {
      if (e.detail.machineId === id) {
        setIsQuizPassed(true);
        const passedQuizzes = JSON.parse(localStorage.getItem('passedQuizzes') || '[]');
        if (!passedQuizzes.includes(id)) {
          passedQuizzes.push(id);
          localStorage.setItem('passedQuizzes', JSON.stringify(passedQuizzes));
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/home" className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to Home
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg overflow-hidden shadow-md border">
              <img 
                src={machine.image} 
                alt={machine.name} 
                className="w-full h-48 object-cover object-center"
              />
            </div>
          </div>
          
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{machine.name}</h1>
            <p className="text-gray-600 mb-4">{machine.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {isCourseCompleted ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Course Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Course Required
                </Badge>
              )}
              
              {isQuizPassed ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Safety Quiz Passed
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Safety Quiz Required
                </Badge>
              )}
              
              {isQuizPassed ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Ready for Booking
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Not Available for Booking
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Course</CardTitle>
              <CardDescription>
                Learn how to safely operate the {machine.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Before you can use the {machine.name}, you must complete the safety course and pass the safety quiz.
              </p>
              
              {isCourseCompleted ? (
                <div className="flex items-center text-green-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Course completed successfully!</span>
                </div>
              ) : (
                <p className="text-yellow-600 mb-4">
                  You haven't completed this course yet.
                </p>
              )}
              
              <Button 
                onClick={() => navigate(`/course/${id}`)}
                className="w-full"
              >
                {isCourseCompleted ? "Review Course Material" : "Start Safety Course"}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Safety Quiz</CardTitle>
              <CardDescription>
                Demonstrate your knowledge of {machine.name} safety
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                After completing the safety course, take this quiz to verify your understanding of safe operation procedures.
              </p>
              
              {isQuizPassed ? (
                <div className="flex items-center text-green-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Quiz passed successfully!</span>
                </div>
              ) : (
                <p className={`${isCourseCompleted ? 'text-blue-600' : 'text-gray-500'} mb-4`}>
                  {isCourseCompleted 
                    ? "You're ready to take the safety quiz!" 
                    : "Complete the safety course first to unlock the quiz."}
                </p>
              )}
              
              <Button 
                onClick={() => navigate(`/quiz/${id}`)}
                className="w-full"
                disabled={!isCourseCompleted && !isQuizPassed}
              >
                {isQuizPassed ? "Review Quiz Questions" : "Take Safety Quiz"}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Book {machine.name}</CardTitle>
              <CardDescription>
                Reserve time to use the {machine.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isQuizPassed ? (
                <div>
                  <p className="mb-4">
                    Congratulations! You've completed all the requirements to use the {machine.name}. 
                    You can now book time slots to use this equipment.
                  </p>
                  <Button 
                    onClick={() => navigate(`/booking/${id}`)}
                    className="w-full"
                  >
                    Book Now
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="mb-4">
                    To book time on the {machine.name}, you must first complete the safety course and pass the safety quiz.
                  </p>
                  <Button 
                    disabled
                    className="w-full opacity-70"
                  >
                    Booking Unavailable
                  </Button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Complete the requirements to unlock booking.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MachineDetail;
