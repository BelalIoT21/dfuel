import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarX, AlertTriangle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { certificationService } from '@/services/certificationService';
import { useAuth } from '@/context/AuthContext';

interface BookMachineButtonProps {
  machineId: string;
  isCertified: boolean;
  machineStatus: string;
  requiresCertification?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  timeSlotUnavailable?: boolean;
}

const BookMachineButton = ({ 
  machineId, 
  isCertified: propIsCertified, 
  machineStatus, 
  requiresCertification = true,
  className = '',
  size = 'default',
  timeSlotUnavailable = false
}: BookMachineButtonProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCertified, setIsCertified] = useState(propIsCertified);
  const [isVerifying, setIsVerifying] = useState(false);

  // Special machine IDs that should not be bookable
  const NON_BOOKABLE_MACHINE_IDS = ['5', '6']; // Safety Cabinet and Safety Course
  
  // Re-check certification status directly from the database when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const verifyCertification = async () => {
      if (!user || !user.id || isVerifying) return;
      
      // Admins are always considered certified
      if (user.isAdmin) {
        if (isMounted) {
          console.log(`BookMachineButton: Admin user can always book machine ${machineId}`);
          setIsCertified(true);
          return;
        }
      }
      
      // For regular users, check certification if required
      if (requiresCertification) {
        try {
          setIsVerifying(true);
          
          // Use certification service with direct API call approach
          const hasCertification = await certificationService.checkCertification(user.id, machineId);
          
          if (isMounted) {
            console.log(`BookMachineButton: User ${hasCertification ? 'has' : 'does not have'} certification for machine ${machineId}`);
            setIsCertified(hasCertification);
          }
        } catch (error) {
          console.error('Error in verifyCertification:', error);
          // Keep the prop value as fallback
          if (isMounted) {
            setIsCertified(propIsCertified);
          }
        } finally {
          if (isMounted) {
            setIsVerifying(false);
          }
        }
      } else {
        // If certification is not required, set to true
        if (isMounted) {
          setIsCertified(true);
        }
      }
    };
    
    verifyCertification();
    
    return () => {
      isMounted = false;
    };
  }, [user, machineId, requiresCertification, propIsCertified, isVerifying]);
  
  // If this is a non-bookable machine ID, don't render the button
  if (NON_BOOKABLE_MACHINE_IDS.includes(machineId)) {
    return null;
  }

  const isAvailable = machineStatus?.toLowerCase() === 'available';
  
  // Admin users can always book machines regardless of certification
  const effectiveCertification = user?.isAdmin ? true : (requiresCertification ? isCertified : true);
  const canBook = effectiveCertification && isAvailable && !timeSlotUnavailable;
  
  const handleBooking = () => {
    if (!canBook) {
      if (timeSlotUnavailable) {
        toast({
          title: "Time Slot Unavailable",
          description: "This time slot has already been booked. Please select another time.",
          variant: "destructive"
        });
        return;
      }
      
      if (!isAvailable) {
        toast({
          title: "Machine Unavailable",
          description: "This machine is currently unavailable for booking",
          variant: "destructive"
        });
        return;
      } 
      
      if (requiresCertification && !effectiveCertification) {
        toast({
          title: "Certification Required",
          description: "You need to be certified to book this machine",
          variant: "destructive"
        });
        return;
      }
      
      return;
    }
    
    // Show toast with booking intent
    toast({
      title: "Booking Machine",
      description: `Navigating to booking page for machine ${machineId}`,
    });
    
    console.log(`Attempting to navigate to booking page for machine ${machineId}`);
    
    // Use React Router navigate for consistent navigation
    navigate(`/booking/${machineId}`);
  };

  let buttonText = "Book Now";
  let ButtonIcon = Calendar; // PascalCase is correct for React components
  
  if (timeSlotUnavailable) {
    buttonText = "Time Slot Unavailable";
    ButtonIcon = CalendarX; 
  } else if (!isAvailable) {
    buttonText = "Machine Unavailable";
    ButtonIcon = AlertTriangle; 
  } else if (requiresCertification && !effectiveCertification) {
    buttonText = "Certification Required";
    ButtonIcon = Award; 
  }

  // Debug logs to trace button rendering
  console.log(`BookMachineButton for machine ${machineId}:`, {
    isCertified,
    propIsCertified,
    isAvailable,
    requiresCertification,
    effectiveCertification,
    isAdmin: user?.isAdmin,
    canBook,
    buttonText
  });

  return (
    <Button 
      onClick={handleBooking} 
      disabled={!canBook}
      className={className}
      size={size}
      variant={canBook ? "default" : "outline"}
    >
      <ButtonIcon className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
};

export default BookMachineButton;
