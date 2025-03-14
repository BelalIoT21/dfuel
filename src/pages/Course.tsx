
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { courses, machines } from '../utils/data';
import { useToast } from '@/hooks/use-toast';

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  
  const machine = machines.find(m => m.id === id);
  const course = courses[id || ''];
  
  if (!machine || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    // In a real app, this would call an API to mark the course as completed
    toast({
      title: "Course completed",
      description: "You can now take the safety quiz."
    });
    navigate(`/machine/${id}`);
  };

  // Simulate progress update when scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPosition = element.scrollTop;
    const maxScroll = element.scrollHeight - element.clientHeight;
    const calculatedProgress = Math.min(Math.round((scrollPosition / maxScroll) * 100), 100);
    setProgress(calculatedProgress);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to={`/machine/${id}`} className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to {machine.name}
          </Link>
          <div className="text-sm text-gray-500">Progress: {progress}%</div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <Progress value={progress} className="mb-8" />
        
        <Card>
          <CardContent className="p-6">
            <div 
              className="prose max-w-none h-[50vh] overflow-y-auto mb-6" 
              onScroll={handleScroll}
            >
              <h2>Introduction</h2>
              <p>Welcome to the safety course for the {machine.name}. This course will teach you how to safely operate this machine.</p>
              
              <h2>Safety Precautions</h2>
              <p>Always wear appropriate safety gear when operating this machine. This includes safety glasses, gloves, and closed-toe shoes.</p>
              
              <h2>Step-by-Step Instructions</h2>
              <p>Follow these steps to safely operate the {machine.name}:</p>
              <ol>
                <li>Ensure the workspace is clean and free of obstructions.</li>
                <li>Put on appropriate safety gear.</li>
                <li>Check that the machine is properly connected and in working order.</li>
                <li>Turn on the machine and wait for it to initialize.</li>
                <li>Follow the specific operation procedures for your project.</li>
                <li>When finished, shut down the machine properly.</li>
                <li>Clean the workspace and return any tools to their proper location.</li>
              </ol>
              
              <h2>Maintenance</h2>
              <p>Regular maintenance is essential for the safe operation of the {machine.name}. Report any issues to the administrator immediately.</p>
              
              <h2>Troubleshooting</h2>
              <p>If you encounter any issues with the {machine.name}, follow these troubleshooting steps:</p>
              <ul>
                <li>Check that the machine is properly powered and connected.</li>
                <li>Look for any error messages on the display.</li>
                <li>Restart the machine if necessary.</li>
                <li>If the issue persists, contact an administrator for assistance.</li>
              </ul>
              
              <h2>Conclusion</h2>
              <p>Congratulations on completing the safety course for the {machine.name}. You are now ready to take the safety quiz and, upon passing, book time to use the machine.</p>
            </div>
            
            <Button 
              onClick={handleComplete} 
              className="w-full"
              disabled={progress < 100}
            >
              {progress < 100 ? "Please complete the course" : "Mark as Completed"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Course;
