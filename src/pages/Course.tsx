
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { SafetyAlert } from '@/components/home/SafetyAlert';
import { PageHeader } from '@/components/home/PageHeader';
import LoadingIndicator from '@/components/home/LoadingIndicator';
import { toast } from '@/components/ui/use-toast';

const CourseContent = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Machine Safety Fundamentals</CardTitle>
          <CardDescription>Learn the basics of machine safety</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">Introduction to Safety</h3>
          <p>
            Machine safety is paramount in any workshop environment. Understanding proper
            procedures and protocols before operating machinery can prevent accidents and
            injuries.
          </p>
          
          <h3 className="text-lg font-semibold">General Safety Guidelines</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Always wear appropriate personal protective equipment (PPE)</li>
            <li>Never operate machinery while under the influence of drugs or alcohol</li>
            <li>Ensure your work area is clean and free of hazards</li>
            <li>Know the location of emergency stops and first aid kits</li>
            <li>Report any equipment malfunctions immediately</li>
          </ul>
          
          <h3 className="text-lg font-semibold">Preparation Checklist</h3>
          <p>
            Before operating any workshop machinery, ensure you have:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Received proper training for the specific machine</li>
            <li>Read and understood the user manual</li>
            <li>Inspected the machine for any visible damage</li>
            <li>Secured loose clothing, jewelry, and long hair</li>
            <li>Set up proper ventilation if required</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={onComplete} className="w-full">
            Complete Course & Take Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addSafetyCourse } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading course data
    const timer = setTimeout(() => {
      if (!id) {
        setError("Course ID is missing");
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  const handleCourseComplete = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to complete the course",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      if (!id) {
        toast({
          title: "Error",
          description: "Course ID is missing",
          variant: "destructive"
        });
        return;
      }

      const success = await addSafetyCourse(id);
      
      if (success) {
        toast({
          title: "Course completed",
          description: "You have successfully completed the safety course"
        });
        
        // Navigate to the quiz page
        navigate(`/quiz/${id}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to register course completion",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Course completion error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
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
          title="Error Loading Course" 
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
        title="Safety Course" 
        description="Complete this course to gain access to the workshop machinery"
        backHref="/home"
      />
      
      <div className="mt-8">
        <CourseContent onComplete={handleCourseComplete} />
      </div>
    </div>
  );
};

export default Course;
