
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
        try {
          console.log(`Loading status for machine: ${id}`);
          let status = 'available'; // Default status
          
          try {
            status = await userDatabase.getMachineStatus(id);
          } catch (statusError) {
            console.error(`Error fetching status for machine ${id}:`, statusError);
            // Leave the default status
          }
          
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
    // If it's not the safety cabinet and user hasn't completed safety course,
    // redirect to safety cabinet
    if (id !== 'safety-cabinet' && !safetyCertified) {
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
    if (id !== 'safety-cabinet' && !safetyCertified) {
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
    // Make sure it's a bookable machine type
    if (machine && machine.type === 'Safety Cabinet') {
      toast({
        title: "Not Bookable",
        description: "Safety Cabinet is not a bookable resource.",
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
    (machine.type !== 'Safety Cabinet' && safetyCertified) : 
    false;
  
  // If it's not the safety cabinet itself, block access until safety course is completed
  const isAccessible = id === 'safety-cabinet' || safetyCertified;
  
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
