
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Award, Book, Calendar, CheckCircle, ChevronLeft, ClipboardCheck, HelpCircle, Lock } from 'lucide-react';
import { machines } from '../utils/data';
import { apiService } from '../services/apiService';
import { certificationService } from '../services/certificationService';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [machine, setMachine] = useState<any>(null);
  const [machineStatus, setMachineStatus] = useState('available');
  const [isCertified, setIsCertified] = useState(false);
  const [hasSafetyCourse, setHasSafetyCourse] = useState(false);

  // Safety course has ID 6
  const SAFETY_COURSE_ID = '6';

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadMachineDetails = async () => {
      try {
        setLoading(true);
        
        // Try to get machine from API first
        let machineData;
        try {
          const response = await apiService.getMachineById(id || '');
          if (response.data) {
            machineData = response.data;
          }
        } catch (apiError) {
          console.error('Error fetching machine from API:', apiError);
        }

        // If API fails, fall back to static data
        if (!machineData) {
          machineData = machines.find(m => m.id === id);
        }
        
        if (!machineData) {
          toast({
            title: 'Error',
            description: 'Machine not found',
            variant: 'destructive',
          });
          navigate('/home');
          return;
        }
        
        // Get machine status
        try {
          const statusResponse = await apiService.getMachineStatus(id || '');
          if (statusResponse.data) {
            setMachineStatus(statusResponse.data.status);
          }
        } catch (statusError) {
          console.error('Error fetching machine status:', statusError);
          setMachineStatus('available');
        }
        
        setMachine(machineData);
        
        // Check if user is certified for this machine
        if (user) {
          try {
            const isUserCertified = await certificationService.checkCertification(user.id, id || '');
            setIsCertified(isUserCertified);
          } catch (certError) {
            console.error('Error checking certification:', certError);
            
            // Fallback to user object if API fails
            if (user.certifications && Array.isArray(user.certifications) && user.certifications.includes(id)) {
              setIsCertified(true);
            }
          }
          
          // Check if user has safety course certification (ID 6)
          try {
            const hasSafety = await certificationService.checkCertification(user.id, SAFETY_COURSE_ID);
            setHasSafetyCourse(hasSafety);
          } catch (safetyCertError) {
            console.error('Error checking safety certification:', safetyCertError);
            
            // Fallback to user object
            if (user.certifications && Array.isArray(user.certifications) && user.certifications.includes(SAFETY_COURSE_ID)) {
              setHasSafetyCourse(true);
            }
          }
        }
      } catch (error) {
        console.error('Error loading machine details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load machine details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadMachineDetails();
  }, [id, user, navigate, toast]);

  const handleGetCertified = async () => {
    try {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to get certified',
          variant: 'destructive',
        });
        return;
      }
      
      const response = await apiService.addCertification(user.id, id || '');
      
      if (response.data && response.data.success) {
        setIsCertified(true);
        toast({
          title: 'Success',
          description: 'You are now certified for this machine!',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to get certified. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error getting certified:', error);
      toast({
        title: 'Error',
        description: 'Failed to get certified. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTakeCourse = () => {
    navigate(`/course/${id}`);
  };

  const handleTakeQuiz = () => {
    navigate(`/quiz/${id}`);
  };

  const handleBookMachine = () => {
    navigate(`/booking/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-purple-700">Loading machine details...</p>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Machine not found</h1>
          <Link to="/home">
            <Button className="bg-purple-600 hover:bg-purple-700">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isMaintenance = machineStatus === 'maintenance';
  const isBookable = !isMaintenance && isCertified && machine.id !== '5' && machine.id !== '6';
  
  // Check if the current machine is the safety course itself
  const isSafetyCourse = id === SAFETY_COURSE_ID;
  
  // Determine if the machine requires safety course
  // The safety course itself doesn't require the safety course (would be circular)
  const requiresSafetyCourse = !isSafetyCourse && id !== '5';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <Link to="/home" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Machines
        </Link>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-32 md:h-48 flex items-end p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{machine.name}</h1>
            </div>
            
            {isCertified && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Certified
              </div>
            )}
            
            {isMaintenance && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Under Maintenance
              </div>
            )}
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-6">{machine.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-purple-800">Machine Type</h3>
                <p>{machine.type || 'Standard Equipment'}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-purple-800">Status</h3>
                <p className={`capitalize ${
                  machineStatus === 'available' ? 'text-green-600' : 
                  machineStatus === 'maintenance' ? 'text-yellow-600' : 
                  machineStatus === 'in-use' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {machineStatus.replace('-', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-purple-600" />
                Training Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">Complete the training course to learn how to use this machine safely and effectively.</p>
              <Button 
                onClick={handleTakeCourse} 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isMaintenance || (requiresSafetyCourse && !hasSafetyCourse)}
              >
                <Book className="mr-2 h-4 w-4" />
                Take Course
              </Button>
              
              {requiresSafetyCourse && !hasSafetyCourse && (
                <div className="mt-4 text-amber-600 text-sm flex items-center">
                  <Lock className="h-4 w-4 mr-1" />
                  Complete Safety Course first
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-purple-600" />
                Safety Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">Take the safety quiz to demonstrate your knowledge of proper machine operation.</p>
              <Button 
                onClick={handleTakeQuiz} 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isMaintenance || (requiresSafetyCourse && !hasSafetyCourse)}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Take Quiz
              </Button>
              
              {requiresSafetyCourse && !hasSafetyCourse && (
                <div className="mt-4 text-amber-600 text-sm flex items-center">
                  <Lock className="h-4 w-4 mr-1" />
                  Complete Safety Course first
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!isCertified ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Get Certified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Become certified to use this machine by completing the training course and safety quiz.
                {requiresSafetyCourse && !hasSafetyCourse && 
                  " You must complete the Safety Course certification first."}
              </p>
              <Button 
                onClick={handleGetCertified} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isMaintenance || (requiresSafetyCourse && !hasSafetyCourse)}
              >
                <Award className="mr-2 h-4 w-4" />
                Get Certified Now
              </Button>
              
              {requiresSafetyCourse && !hasSafetyCourse && (
                <div className="mt-4 text-amber-600 text-sm flex items-center">
                  <Lock className="h-4 w-4 mr-1" />
                  Complete Safety Course first
                </div>
              )}
            </CardContent>
          </Card>
        ) : isBookable ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Book This Machine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                You're certified to use this machine! Book a time slot to use it.
              </p>
              <Button 
                onClick={handleBookMachine} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isMaintenance}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Now
              </Button>
              
              {isMaintenance && (
                <div className="mt-4 text-amber-600 text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Machine is currently under maintenance
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Certification Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You're certified to use this equipment! This specific machine doesn't require booking.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MachineDetail;
