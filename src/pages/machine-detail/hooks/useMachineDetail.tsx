
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { machines, courses } from '@/utils/data';
import userDatabase from '@/services/userDatabase';

export const useMachineDetail = (id: string | undefined) => {
  const { user, addCertification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [machineStatus, setMachineStatus] = useState('available');
  const [safetyCabinetCompleted, setSafetyCabinetCompleted] = useState(false);
  const [safetyCourseCompleted, setSafetyCourseCompleted] = useState(false);
  const [allSafetyRequirementsMet, setAllSafetyRequirementsMet] = useState(false);
  
  const machine = machines.find(m => m.id === id);
  const course = courses[id || ''];
  
  useEffect(() => {
    // Load certification status
    if (user && id) {
      // Check if user is certified for this machine
      if (user.certifications.includes(id)) {
        setCourseCompleted(true);
        setQuizPassed(true);
        setProgress(100);
      }
      
      // Check if user has completed safety cabinet
      const hasSafetyCabinetCert = user.certifications.includes('safety-cabinet');
      setSafetyCabinetCompleted(hasSafetyCabinetCert);
      
      // Check if user has completed safety course
      const hasSafetyCourseCert = user.certifications.includes('safety-course');
      setSafetyCourseCompleted(hasSafetyCourseCert);
      
      // Both requirements need to be met
      setAllSafetyRequirementsMet(hasSafetyCabinetCert && hasSafetyCourseCert);
    }

    // Load machine status
    const loadMachineStatus = async () => {
      if (id) {
        // Special case for safety cabinet and course - always use 'available' without API call
        if (id === 'safety-cabinet' || id === 'safety-course') {
          console.log(`Setting hardcoded available status for ${id}`);
          setMachineStatus('available');
          return;
        }
        
        // For regular machines, try to get status from database
        try {
          console.log(`Loading status for machine: ${id}`);
          const status = await userDatabase.getMachineStatus(id);
          setMachineStatus(status || 'available');
        } catch (error) {
          console.error(`Error loading machine status for ${id}:`, error);
          setMachineStatus('available');
        }
      }
    };

    loadMachineStatus();
  }, [user, id]);
  
  const handleStartCourse = () => {
    navigate(`/course/${id}`);
  };
  
  const handleStartQuiz = () => {
    navigate(`/quiz/${id}`);
  };
  
  const handleBookMachine = () => {
    // Make sure it's a bookable machine type
    if (machine && (machine.type === 'Safety Equipment' || machine.type === 'Training')) {
      toast({
        title: "Not Bookable",
        description: `${machine.name} is not a bookable resource.`,
        variant: "destructive"
      });
      return;
    }
    
    // Check if user has completed both safety requirements
    if (!allSafetyRequirementsMet) {
      if (!safetyCourseCompleted) {
        toast({
          title: "Safety Course Required",
          description: "You must complete the safety course before booking machines.",
          variant: "destructive"
        });
        navigate(`/machine/safety-course`);
      } else if (!safetyCabinetCompleted) {
        toast({
          title: "Safety Cabinet Certification Required",
          description: "You must complete the safety cabinet certification before booking machines.",
          variant: "destructive"
        });
        navigate(`/machine/safety-cabinet`);
      }
      return;
    }
    
    navigate(`/booking/${id}`);
  };
  
  const handlePassQuiz = async () => {
    try {
      if (user && id) {
        const success = await addCertification(id);
        if (success) {
          setQuizPassed(true);
          setProgress(100);
          
          toast({
            title: "Certification Earned!",
            description: `You are now certified to use the ${machine?.name}.`,
          });
        } else {
          toast({
            title: "Certification Failed",
            description: "There was an issue adding your certification. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to get certified.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding certification:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while processing your certification.",
        variant: "destructive"
      });
    }
  };
  
  // Determine if machine is bookable
  const isBookable = machine ? 
    (machine.type !== 'Safety Equipment' && 
     machine.type !== 'Training' && 
     allSafetyRequirementsMet) : 
    false;
  
  // If it's not a safety-related machine, block access until both safety requirements are met
  const isAccessible = id === 'safety-cabinet' || 
                       id === 'safety-course' || 
                       allSafetyRequirementsMet;
  
  return {
    machine,
    course,
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
  };
};
