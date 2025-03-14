import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { machines, courses, quizzes } from '../utils/data';

const MachineDetail = () => {
  const { id } = useParams();
  const { user, addCertification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  
  const machine = machines.find(m => m.id === id);
  const course = courses[id || ''];
  
  useEffect(() => {
    if (user && user.certifications.includes(id || '')) {
      setCourseCompleted(true);
      setQuizPassed(true);
      setProgress(100);
    }
  }, [user, id]);
  
  const handleStartCourse = () => {
    navigate(`/course/${id}`);
  };
  
  const handleStartQuiz = () => {
    navigate(`/quiz/${id}`);
  };
  
  const handleBookMachine = () => {
    navigate(`/booking/${id}`);
  };
  
  const handleCompleteCourse = () => {
    setCourseCompleted(true);
    setProgress(progress => Math.min(progress + 50, 100));
    
    toast({
      title: "Course Completed!",
      description: "You can now take the quiz to get certified.",
    });
  };
  
  const handlePassQuiz = () => {
    setQuizPassed(true);
    setProgress(100);
    
    if (user && id) {
      addCertification(id);
      
      toast({
        title: "Certification Earned!",
        description: `You are now certified to use the ${machine?.name}.`,
      });
    }
  };
  
  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Machine Not Found</h1>
          <Link to="/home">
            <Button className="bg-purple-600 hover:bg-purple-700">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const isBookable = machine.type !== 'Safety Cabinet';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <div className="mb-6">
          <Link to="/home" className="text-purple-600 hover:underline flex items-center gap-1">
            &larr; Back to Machines
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="md:w-1/3">
            <Card className="overflow-hidden h-full">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <img 
                  src={machine.image} 
                  alt={machine.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant={machine.status === 'available' ? 'default' : 'destructive'} className="bg-purple-600">
                    {machine.status === 'available' ? 'Available' : 'Maintenance'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Last maintained: {machine.maintenanceDate}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-1">Certification Progress</div>
                  <Progress value={progress} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
                  <div className="flex justify-between text-sm mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:w-2/3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-2xl">{machine.name}</CardTitle>
                <CardDescription>{machine.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="specs">Specifications</TabsTrigger>
                    <TabsTrigger value="certification">Certification</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">About this Machine</h3>
                      <p className="text-gray-600">
                        {machine.description} This specialized equipment requires proper training 
                        before use to ensure safety and optimal results.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Usage Requirements</h3>
                      <ul className="list-disc pl-5 text-gray-600 space-y-1">
                        <li>Complete the safety training course</li>
                        <li>Pass the certification quiz</li>
                        {isBookable && <li>Book machine time in advance</li>}
                        <li>Follow all safety protocols</li>
                        <li>Report any issues immediately</li>
                      </ul>
                    </div>
                    
                    {isBookable && (
                      <Button 
                        onClick={handleBookMachine} 
                        disabled={!user?.certifications.includes(machine.id)}
                        className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                      >
                        {user?.certifications.includes(machine.id) 
                          ? "Book Machine" 
                          : "Get Certified to Book"}
                      </Button>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="specs">
                    <div className="space-y-4">
                      <h3 className="font-medium">Technical Specifications</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(machine.specs || {}).map(([key, value]) => (
                          <div key={key} className="border rounded-lg p-3">
                            <div className="text-sm text-gray-500 capitalize">{key}</div>
                            <div className="font-medium">
                              {Array.isArray(value) 
                                ? value.join(', ') 
                                : value.toString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="certification" className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Safety Course</h3>
                      <p className="text-gray-600">
                        Learn how to safely operate the {machine.name} through our comprehensive course.
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button 
                          onClick={handleStartCourse}
                          variant={courseCompleted ? "outline" : "default"}
                          className={courseCompleted ? "border-purple-200 text-purple-700" : "bg-purple-600 hover:bg-purple-700"}
                        >
                          {courseCompleted ? "Review Course" : "Start Course"}
                        </Button>
                        
                        {!courseCompleted && (
                          <Button 
                            variant="outline"
                            className="border-purple-200 text-purple-700"
                            onClick={handleCompleteCourse}
                          >
                            (Demo) Mark Course Complete
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Certification Quiz</h3>
                      <p className="text-gray-600">
                        Demonstrate your knowledge by passing the certification quiz.
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button 
                          onClick={handleStartQuiz}
                          variant={quizPassed ? "outline" : "default"}
                          disabled={!courseCompleted}
                          className={quizPassed ? "border-purple-200 text-purple-700" : "bg-purple-600 hover:bg-purple-700"}
                        >
                          {quizPassed ? "Review Quiz" : "Start Quiz"}
                        </Button>
                        
                        {courseCompleted && !quizPassed && (
                          <Button 
                            variant="outline"
                            className="border-purple-200 text-purple-700"
                            onClick={handlePassQuiz}
                          >
                            (Demo) Mark Quiz Passed
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {quizPassed && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-3">
                        <div className="bg-green-500 text-white p-1 rounded-full">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Certification Complete!</p>
                          <p className="text-sm text-gray-600">You are now certified to use this machine.</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineDetail;
