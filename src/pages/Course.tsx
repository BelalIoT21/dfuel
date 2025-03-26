
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { machineService } from '@/services/machineService';
import { ChevronLeft, Loader2, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [machine, setMachine] = useState<any>(null);
  const [courseContent, setCourseContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching course data for machine ID: ${id}`);
        
        // First, get the machine
        const machineData = await machineService.getMachineById(id);
        
        if (!machineData) {
          console.error(`Machine with ID ${id} not found`);
          setError('Course not found');
          setLoading(false);
          return;
        }
        
        console.log('Retrieved machine data:', machineData);
        setMachine(machineData);
        
        // Generate course content if not available
        let content = machineData.courseContent;
        
        if (!content) {
          if (id === '6') {
            // Safety course
            content = generateSafetyCourseContent();
          } else {
            // Regular machine course
            content = generateMachineCourseContent(machineData);
          }
        }
        
        setCourseContent(content);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const generateSafetyCourseContent = () => {
    return `
      <h2>Safety Guidelines for Machine Shop</h2>
      <p>Welcome to the essential safety course for our machine shop. This course covers the fundamental safety practices that all users must follow.</p>
      
      <h3>General Safety Rules</h3>
      <ul>
        <li>Always wear appropriate Personal Protective Equipment (PPE)</li>
        <li>No loose clothing, long hair must be tied back</li>
        <li>No jewelry or watches when operating machinery</li>
        <li>No food or drinks in the machine shop area</li>
        <li>Never operate machinery while impaired or tired</li>
        <li>Report all accidents and incidents immediately</li>
      </ul>
      
      <h3>Emergency Procedures</h3>
      <p>Familiarize yourself with:</p>
      <ul>
        <li>Location of emergency stops</li>
        <li>Fire extinguisher locations</li>
        <li>First aid kit locations</li>
        <li>Emergency exit routes</li>
        <li>Emergency contact numbers</li>
      </ul>
      
      <h3>Machine Shop Etiquette</h3>
      <ul>
        <li>Clean up after yourself</li>
        <li>Return tools to their proper places</li>
        <li>Report damaged or malfunctioning equipment</li>
        <li>Be respectful of others using the space</li>
        <li>Follow the booking system procedures</li>
      </ul>
      
      <p>After completing this course and passing the quiz, you'll be certified to move on to machine-specific certifications.</p>
    `;
  };

  const generateMachineCourseContent = (machine: any) => {
    const machineName = machine.name || 'this machine';
    const machineType = machine.type || 'equipment';
    
    return `
      <h2>Training Course: ${machineName}</h2>
      <p>Welcome to the ${machineName} training course. This course will guide you through the proper operation, safety procedures, and maintenance for this ${machineType}.</p>
      
      <h3>About the ${machineName}</h3>
      <p>${machine.description || 'This is a specialized piece of equipment in our facility.'}</p>
      
      <h3>Technical Specifications</h3>
      <p>${machine.specifications || 'Specifications for this machine are available upon request from staff.'}</p>
      
      <h3>Safety Precautions</h3>
      <ul>
        <li>Always wear appropriate PPE including eye protection</li>
        <li>Ensure the work area is clean and free of obstructions</li>
        <li>Never leave the machine unattended while in operation</li>
        <li>Do not attempt to modify or bypass any safety features</li>
        <li>Follow proper shutdown procedures when finished</li>
      </ul>
      
      <h3>Operating Instructions</h3>
      <ol>
        <li>Turn on the machine using the main power switch</li>
        <li>Allow the machine to initialize completely</li>
        <li>Set up your project parameters according to guidelines</li>
        <li>Double-check all settings before starting operation</li>
        <li>Monitor the process throughout the operation</li>
        <li>When finished, follow proper shutdown procedures</li>
      </ol>
      
      <h3>Troubleshooting</h3>
      <p>If you encounter any issues with the machine:</p>
      <ul>
        <li>Stop the operation using the appropriate procedure</li>
        <li>Refer to the troubleshooting guide next to the machine</li>
        <li>If unable to resolve, contact a staff member</li>
        <li>Do not attempt to fix mechanical or electrical issues yourself</li>
      </ul>
      
      <p>After completing this course, take the quiz to test your knowledge and get certified to use the ${machineName}.</p>
    `;
  };

  const handleTakeQuiz = () => {
    if (!id) return;
    
    navigate(`/quiz/${id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/home')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Button
        variant="ghost"
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="shadow-lg border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-2xl text-purple-800">
              {machine?.name} Course
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: courseContent }}
          />
          
          <Separator className="my-8" />
          
          <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
            <h3 className="text-blue-800 font-medium mb-2">Important Note</h3>
            <p className="text-blue-700 text-sm">
              After studying this material, please take the quiz to test your knowledge.
              Passing the quiz is required to gain certification for this machine.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end pt-2 pb-6">
          <Button 
            onClick={handleTakeQuiz}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Take Quiz Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Course;
