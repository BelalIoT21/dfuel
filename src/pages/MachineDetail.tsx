
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { machines } from '../utils/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const machine = machines.find(m => m.id === id);
  
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-5xl mx-auto page-transition">
        <div className="mb-6">
          <Link to="/home" className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to Machines
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={machine.image} 
                alt={machine.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{machine.name}</h1>
            <p className="text-gray-700 mb-6">{machine.description}</p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {machine.courseCompleted ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Course Complete
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Course Pending
                </span>
              )}
              
              {machine.quizPassed ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Quiz Passed
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Quiz Required
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Safety Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Learn how to safely use this machine with our comprehensive course.</p>
                <Link to={`/course/${machine.id}`}>
                  <Button className="w-full">
                    {machine.courseCompleted ? 'Review Course' : 'Start Course'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Safety Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Test your knowledge with our safety quiz. You must pass to book the machine.</p>
                <Link to={`/quiz/${machine.id}`}>
                  <Button 
                    className="w-full" 
                    variant={machine.courseCompleted ? "default" : "outline"}
                    disabled={!machine.courseCompleted}
                  >
                    {machine.quizPassed ? 'Review Quiz' : 'Take Quiz'}
                  </Button>
                </Link>
                {!machine.courseCompleted && (
                  <p className="text-sm text-gray-500 mt-2">You must complete the course first</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Machine Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Book a time slot to use this machine.</p>
                <Link to={`/booking/${machine.id}`}>
                  <Button 
                    className="w-full" 
                    variant={machine.quizPassed ? "default" : "outline"}
                    disabled={!machine.quizPassed}
                  >
                    Book Machine
                  </Button>
                </Link>
                {!machine.quizPassed && (
                  <p className="text-sm text-gray-500 mt-2">You must pass the quiz first</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineDetail;
