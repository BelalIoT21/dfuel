
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { machines } from '../utils/data';
import { useAuth } from '../context/AuthContext';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'course' | 'booking'>('info');
  
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
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/home" className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-center">{machine.name}</h1>
          <div className="w-24"></div> {/* Empty div for balance */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>{machine.name}</CardTitle>
                <CardDescription>{machine.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <img
                    src={machine.image}
                    alt={machine.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-4">
                  <Button 
                    variant={activeTab === 'info' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('info')}
                  >
                    Machine Information
                  </Button>
                  
                  <Button 
                    variant={activeTab === 'course' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('course')}
                  >
                    Safety Course
                    {machine.courseCompleted && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    variant={activeTab === 'booking' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('booking')}
                    disabled={!machine.quizPassed}
                  >
                    Book Machine
                    {!machine.quizPassed && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pass Quiz First
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                {activeTab === 'info' && (
                  <div className="prose max-w-none">
                    <h2>About {machine.name}</h2>
                    <p>{machine.description}</p>
                    
                    <h3>Specifications</h3>
                    <ul>
                      <li>Model: {machine.id.toUpperCase()}-1000</li>
                      <li>Manufacturer: Machine Master Inc.</li>
                      <li>Power: 110V / 220V</li>
                      <li>Weight: 50kg</li>
                    </ul>
                    
                    <h3>Usage Guidelines</h3>
                    <p>Before using this machine, you must complete the safety course and pass the quiz. Once you've been certified, you can book time slots to use the machine.</p>
                  </div>
                )}
                
                {activeTab === 'course' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Safety Course</h2>
                    <p className="text-gray-600">Complete this course to learn how to safely operate the {machine.name}.</p>
                    
                    <div className="space-y-4">
                      {machine.courseCompleted ? (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-green-800">
                          <h3 className="font-medium">Course Completed!</h3>
                          <p>You have successfully completed the safety course for this machine.</p>
                          
                          {machine.quizPassed ? (
                            <p className="mt-2">You have also passed the safety quiz and can now book the machine.</p>
                          ) : (
                            <div className="mt-4">
                              <Link to={`/quiz/${machine.id}`}>
                                <Button>Take Safety Quiz</Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p>You need to complete the safety course before you can take the quiz and book the machine.</p>
                          <Link to={`/course/${machine.id}`}>
                            <Button>Start Safety Course</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'booking' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Book Machine</h2>
                    
                    {machine.quizPassed ? (
                      <div>
                        <p className="text-gray-600 mb-4">Select a time slot to book the {machine.name}.</p>
                        <Link to={`/booking/${machine.id}`}>
                          <Button className="w-full">Go to Booking Page</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800">
                        <h3 className="font-medium">Quiz Required</h3>
                        <p>You must pass the safety quiz before you can book this machine.</p>
                        
                        <div className="mt-4">
                          <Link to={`/quiz/${machine.id}`}>
                            <Button variant="outline">Take Safety Quiz</Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
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
