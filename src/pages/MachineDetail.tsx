
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMachineDetail } from './machine-detail/hooks/useMachineDetail';
import { NotFoundView } from './machine-detail/components/NotFoundView';
import { MachineImage } from './machine-detail/components/MachineImage';
import { MachineDetailTabs } from './machine-detail/components/MachineDetailTabs';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const MachineDetail = () => {
  const { id } = useParams();
  
  const {
    machine,
    user,
    progress,
    courseCompleted,
    quizPassed,
    isBookable,
    machineStatus,
    isAccessible,
    safetyCabinetCompleted,
    safetyCourseCompleted,
    allSafetyRequirementsMet,
    handleStartCourse,
    handleStartQuiz,
    handleBookMachine,
    handlePassQuiz
  } = useMachineDetail(id);
  
  if (!machine) {
    return <NotFoundView />;
  }
  
  const isCertified = user?.certifications.includes(machine.id) || false;
  const isSafetyCabinet = machine.id === 'safety-cabinet';
  const isSafetyCourse = machine.id === 'safety-course';
  const isSafetyRelated = isSafetyCabinet || isSafetyCourse;
  
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
            <MachineImage
              image={machine.image}
              imageUrl={machine.imageUrl}
              name={machine.name}
              status={machineStatus}
              maintenanceDate={machine.maintenanceDate}
              progress={progress}
            />
          </div>
          
          <div className="md:w-2/3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-2xl">{machine.name}</CardTitle>
                <CardDescription>{machine.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                {!isAccessible && !isSafetyRelated ? (
                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-yellow-800 mb-1">Safety Requirements Needed</h3>
                        <p className="text-yellow-700 mb-3">
                          You must complete both safety requirements before accessing this machine.
                        </p>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            {safetyCourseCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-yellow-500" />
                            )}
                            <span className={`text-sm ${safetyCourseCompleted ? "text-green-700" : "text-yellow-700"}`}>
                              Safety Course {safetyCourseCompleted ? "Completed" : "Required"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {safetyCabinetCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-yellow-500" />
                            )}
                            <span className={`text-sm ${safetyCabinetCompleted ? "text-green-700" : "text-yellow-700"}`}>
                              Safety Cabinet Certification {safetyCabinetCompleted ? "Completed" : "Required"}
                            </span>
                          </div>
                        </div>
                        
                        {!safetyCourseCompleted ? (
                          <Button 
                            onClick={() => window.location.href = '/machine/safety-course'}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white mr-2"
                          >
                            Take Safety Course
                          </Button>
                        ) : !safetyCabinetCompleted ? (
                          <Button 
                            onClick={() => window.location.href = '/machine/safety-cabinet'}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            Complete Safety Cabinet Certification
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <MachineDetailTabs
                    description={machine.description}
                    specs={machine.specs || {}}
                    isBookable={isBookable}
                    courseCompleted={courseCompleted}
                    quizPassed={quizPassed}
                    onStartCourse={handleStartCourse}
                    onStartQuiz={handleStartQuiz}
                    onBookMachine={handleBookMachine}
                    onPassQuiz={handlePassQuiz}
                    isCertified={isCertified}
                    isSafetyCabinet={isSafetyCabinet}
                    isSafetyCourse={isSafetyCourse}
                  />
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
