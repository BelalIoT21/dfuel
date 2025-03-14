
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
  const [safetyCertified, setSafetyCertified] = useState(false);
  
  const machine = machines.find(m => m.id === id);
  const course = courses[id || ''];
  const isSafetyCabinet = id === 'safety-cabinet';
  
  useEffect(() => {
    // Load certification status
    if (user && id) {
      // Check if user is certified for this machine
      if (user.certifications.includes(id)) {
        setCourseCompleted(true);
        setQuizPassed(true);
        setProgress(100);
      }
      
      // Check if user has completed safety course
      setSafetyCertified(user.certifications.includes('safety-cabinet'));
    }

    // Load machine status
    const loadMachineStatus = async () => {
      if (id) {
        // Safety cabinet is equipment, not a machine - always available
        if (isSafetyCabinet) {
          console.log('Setting hardcoded available status for safety cabinet');
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
  }, [user, id, isSafetyCabinet]);
  
  const handleStartCourse = () => {
    // If it's not the safety cabinet and user hasn't completed safety course,
    // redirect to safety cabinet
    if (!isSafetyCabinet && !safetyCertified) {
      toast({
        title: "Safety Course Required",
        description: "You must complete the safety course first.",
        variant: "destructive"
      });
      navigate(`/machine/safety-cabinet`);
      return;
    }
    
    navigate(`/course/${id}`);
  };
  
  const handleStartQuiz = () => {
    // If it's not the safety cabinet and user hasn't completed safety course,
    // redirect to safety cabinet
    if (!isSafetyCabinet && !safetyCertified) {
      toast({
        title: "Safety Course Required",
        description: "You must complete the safety course first.",
        variant: "destructive"
      });
      navigate(`/machine/safety-cabinet`);
      return;
    }
    
    navigate(`/quiz/${id}`);
  };
  
  const handleBookMachine = () => {
    // Safety cabinet is equipment and cannot be booked
    if (isSafetyCabinet) {
      toast({
        title: "Not Bookable",
        description: "Safety Cabinet is training equipment and cannot be booked.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user has completed safety course
    if (!safetyCertified) {
      toast({
        title: "Safety Course Required",
        description: "You must complete the safety course before booking machines.",
        variant: "destructive"
      });
      navigate(`/machine/safety-cabinet`);
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
            description: isSafetyCabinet 
              ? "You have completed the safety course."
              : `You are now certified to use the ${machine?.name}.`,
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
  
  // Determine if machine is bookable - safety cabinet is never bookable
  const isBookable = machine ? 
    (!isSafetyCabinet && safetyCertified) : 
    false;
  
  // If it's not the safety cabinet itself, block access until safety course is completed
  const isAccessible = isSafetyCabinet || safetyCertified;
  
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
    safetyCertified,
    handleStartCourse,
    handleStartQuiz,
    handleBookMachine,
    handlePassQuiz
  };
};
