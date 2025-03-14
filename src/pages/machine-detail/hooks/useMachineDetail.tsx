
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { machines, courses } from '@/utils/data';

export const useMachineDetail = (id: string | undefined) => {
  const { user, addCertification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  
  const machine = machines.find(m => m.id === id);
  const course = courses[id || ''];
  
  useEffect(() => {
    if (user && user.certifications.includes(id || '')) {
      setCourseCompleted(true);
      setQuizPassed(true);
      setProgress(100);
    }
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
  
  const handlePassQuiz = () => {
    setQuizPassed(true);
    setProgress(100);
    
    if (user && id) {
      addCertification(id);
      
      toast({
        title: "Certification Earned!",
        description: `You are now certified to use the ${machine?.name}.`,
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
    handleStartCourse,
    handleStartQuiz,
    handleBookMachine,
    handlePassQuiz
  };
};
