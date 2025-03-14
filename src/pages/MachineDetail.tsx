
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMachineDetail } from './machine-detail/hooks/useMachineDetail';
import { NotFoundView } from './machine-detail/components/NotFoundView';
import { MachineImage } from './machine-detail/components/MachineImage';
import { MachineDetailTabs } from './machine-detail/components/MachineDetailTabs';

const MachineDetail = () => {
  const { id } = useParams();
  
  const {
    machine,
    user,
    progress,
    courseCompleted,
    quizPassed,
    isBookable,
    handleStartCourse,
    handleStartQuiz,
    handleBookMachine,
    handlePassQuiz
  } = useMachineDetail(id);
  
  if (!machine) {
    return <NotFoundView />;
  }
  
  const isCertified = user?.certifications.includes(machine.id) || false;
  
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
              name={machine.name}
              status={machine.status}
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
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineDetail;
