
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
  
  const machine = machines.find(m => m.id === id);
  const course = courses[id || ''];
  
  useEffect(() => {
    // Load certification status
    if (user && id && user.certifications.includes(id)) {
      setCourseCompleted(true);
      setQuizPassed(true);
      setProgress(100);
    }

    // Load machine status
    const loadMachineStatus = async () => {
      if (id) {
        try {
          const status = await userDatabase.getMachineStatus(id);
          setMachineStatus(status || 'available');
        } catch (error) {
          console.error("Error loading machine status:", error);
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
    if (machine && machine.type === 'Safety Cabinet') {
      toast({
        title: "Not Bookable",
        description: "Safety Cabinet is not a bookable resource.",
        variant: "destructive"
      });
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
  
  const isBookable = machine ? machine.type !== 'Safety Cabinet' : false;
  
  return {
    machine,
    course,
    user,
    progress,
    courseCompleted,
    quizPassed,
    isBookable,
    machineStatus,
    handleStartCourse,
    handleStartQuiz,
    handleBookMachine,
    handlePassQuiz
  };
};
