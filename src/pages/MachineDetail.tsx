
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { machineService } from '@/services/machineService';
import { certificationService } from '@/services/certificationService';
import { ChevronLeft, Loader2, Calendar, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookMachineButton from '@/components/profile/BookMachineButton';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [machine, setMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [machineStatus, setMachineStatus] = useState('unknown');
  const [isCertified, setIsCertified] = useState(false);
  const [hasSafetyCertification, setHasSafetyCertification] = useState(false);

  const fromAdmin = location.pathname.includes('/admin') || location.state?.fromAdmin;

  const getProperImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg';
    
    if (url.startsWith('/utils/images')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${apiUrl}/api${url}`;
    }
    
    if (url.startsWith('data:')) {
      return url;
    }
    
    return url;
  };

  useEffect(() => {
    if (!id) return;

    const fetchMachineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching machine with ID: ${id}`);
        const machineData = await machineService.getMachineById(id);
        
        if (!machineData) {
          console.error(`Machine with ID ${id} not found`);
          setError('Machine not found');
          setLoading(false);
          return;
        }
        
        console.log('Retrieved machine data:', machineData);
        setMachine(machineData);
        
        try {
          const status = await machineService.getMachineStatus(id);
          setMachineStatus(status.toLowerCase());
          console.log(`Machine status: ${status}`);
        } catch (statusError) {
          console.error('Error fetching machine status:', statusError);
          setMachineStatus(machineData.status?.toLowerCase() || 'unknown');
        }
        
        if (user) {
          try {
            // First, try to get all user certifications
            console.log(`Checking certifications for user ${user.id} on machine ${id}`);
            const userCertifications = await certificationService.getUserCertifications(user.id);
            console.log('User certifications:', userCertifications);
            
            // Check if the current machine ID is in the user's certifications
            const machineIdString = String(id);
            const hasCert = userCertifications.some(cert => String(cert) === machineIdString);
            console.log(`User ${hasCert ? 'has' : 'does not have'} certification for machine ${machineIdString}`);
            setIsCertified(hasCert);
            
            // If direct check failed, try the certification-specific endpoint as fallback
            if (!hasCert) {
              const certificationResult = await certificationService.checkCertification(user.id, id);
              console.log(`Fallback certification check result: ${certificationResult}`);
              setIsCertified(hasCert || certificationResult);
            }
            
            // Check safety certification
            const safetyIdString = '6';
            const hasSafetyCert = userCertifications.some(cert => String(cert) === safetyIdString);
            console.log(`User ${hasSafetyCert ? 'has' : 'does not have'} safety certification`);
            setHasSafetyCertification(hasSafetyCert);
            
            // If direct check failed, try the certification-specific endpoint
            if (!hasSafetyCert) {
              const safetyCertResult = await certificationService.checkCertification(user.id, '6');
              console.log(`Fallback safety certification check result: ${safetyCertResult}`);
              setHasSafetyCertification(hasSafetyCert || safetyCertResult);
            }
          } catch (certError) {
            console.error('Error checking certification:', certError);
          }
        }
      } catch (err) {
        console.error('Error fetching machine details:', err);
        setError('Failed to load machine details');
      } finally {
        setLoading(false);
      }
    };

    fetchMachineData();
  }, [id, user]);

  const handleGetCertified = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to get certified",
        variant: "destructive"
      });
      navigate('/login', { state: { from: `/machine/${id}` } });
      return;
    }

    if (!hasSafetyCertification && id !== '6') {
      toast({
        title: "Safety Certification Required",
        description: "You need to complete the safety course before getting certified for this machine",
        variant: "destructive"
      });
      navigate('/machine/6');
      return;
    }

    try {
      const success = await certificationService.addCertification(user.id, id || '');
      
      if (success) {
        setIsCertified(true);
        toast({
          title: "Certification Successful",
          description: `You are now certified to use the ${machine.name}`,
        });
      } else {
        toast({
          title: "Certification Failed",
          description: "Unable to add certification. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error getting certified:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleTakeCourse = () => {
    if (!id) return;
    
    if (!machine?.linkedCourseId) {
      toast({
        title: "No Course Available",
        description: "This machine doesn't have a linked course yet.",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/course/${machine.linkedCourseId}`);
  };

  const handleTakeQuiz = () => {
    if (!id) return;
    
    if (!machine?.linkedQuizId) {
      toast({
        title: "No Quiz Available",
        description: "This machine doesn't have a linked quiz yet.",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Navigating to quiz with ID: ${machine.linkedQuizId}`);
    navigate(`/quiz/${machine.linkedQuizId}`);
  };

  const handleGoBack = () => {
    // Always navigate back to dashboard instead of using the browser history
    if (user?.isAdmin) {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading machine details...</p>
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

  const requiresCertification = machine?.requiresCertification !== false;
  const hasLinkedCourse = !!machine?.linkedCourseId;
  const hasLinkedQuiz = !!machine?.linkedQuizId;

  const machineImageUrl = getProperImageUrl(machine?.imageUrl || machine?.image || '/placeholder.svg');
  
  console.log("MachineDetail - displaying image:", machineImageUrl);
  console.log("Machine has linked course:", hasLinkedCourse, machine?.linkedCourseId);
  console.log("Machine has linked quiz:", hasLinkedQuiz, machine?.linkedQuizId);
  console.log("User certification status:", isCertified);

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Button
        variant="ghost"
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        onClick={handleGoBack}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="shadow-lg border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-purple-800">{machine?.name}</CardTitle>
              <CardDescription className="text-sm mt-1">{machine?.type}</CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`
                ${machineStatus === 'available' ? 'bg-green-100 text-green-800 border-green-200' : 
                  machineStatus === 'maintenance' ? 'bg-red-100 text-red-800 border-red-200' : 
                  machineStatus === 'in-use' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                  'bg-gray-100 text-gray-800 border-gray-200'}
              `}
            >
              {machineStatus === 'available' ? 'Available' : 
                machineStatus === 'maintenance' ? 'Maintenance' : 
                machineStatus === 'in-use' ? 'In Use' : 
                'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="rounded-md overflow-hidden">
            <img 
              src={machineImageUrl}
              alt={machine?.name} 
              className="w-full h-64 object-cover"
              onError={(e) => {
                console.error(`Failed to load image: ${machineImageUrl}`);
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{machine?.description}</p>
          </div>
          
          {machine?.specifications && (
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Specifications</h3>
              <p className="text-gray-600">{machine.specifications}</p>
            </div>
          )}
          
          {requiresCertification && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <h3 className="font-medium text-gray-800 mb-2">Certification Status</h3>
              {isCertified ? (
                <div className="flex items-center text-green-600">
                  <Award className="mr-2 h-5 w-5" />
                  <span>You are certified to use this machine</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <span>You need to get certified before using this machine</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            {hasLinkedCourse && (
              <Button 
                onClick={handleTakeCourse} 
                variant="outline"
                className="flex-1"
              >
                Take Course
              </Button>
            )}
            
            {hasLinkedQuiz && (
              <Button 
                onClick={handleTakeQuiz} 
                variant="outline"
                className="flex-1"
              >
                Take Quiz
              </Button>
            )}
            
            {/* Don't render booking button for special machines */}
            {id !== '5' && id !== '6' && (
              <BookMachineButton 
                machineId={id || ''}
                isCertified={isCertified || !requiresCertification}
                machineStatus={machineStatus}
                className="flex-1"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineDetail;
