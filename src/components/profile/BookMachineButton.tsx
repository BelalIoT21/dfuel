import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarX, AlertTriangle } from 'lucide-react';
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
      if (!user || !user.id || !requiresCertification || isVerifying) return;
      
      try {
        setIsVerifying(true);
        
        // First try to check if the certification is in user object if available
        if (user.certifications && Array.isArray(user.certifications)) {
          const machineIdStr = String(machineId);
          const hasCert = user.certifications.some(cert => String(cert) === machineIdStr);
          if (hasCert && isMounted) {
            console.log(`BookMachineButton: User has certification from user object for machine ${machineId}`);
            setIsCertified(true);
            setIsVerifying(false);
            return;
          }
        }
        
        // Skip the expensive API call if the prop already says user is certified
        if (propIsCertified) {
          console.log(`BookMachineButton: Using prop value for certification (${machineId}): ${propIsCertified}`);
          setIsCertified(true);
          setIsVerifying(false);
          return;
        }
        
        // Use certification service with better error handling
        try {
          // Force convert to strings to ensure consistent comparison
          const userIdStr = String(user.id);
          const machineIdStr = String(machineId);
          
          console.log(`BookMachineButton: Checking certification for user ${userIdStr}, machine ${machineIdStr}`);
          
          // Try the certification service
          const hasCertFromService = await certificationService.checkCertification(userIdStr, machineIdStr);
          
          if (isMounted) {
            console.log(`BookMachineButton: User ${hasCertFromService ? 'has' : 'does not have'} certification for machine ${machineId}`);
            setIsCertified(hasCertFromService);
          }
        } catch (serviceError) {
          console.error('Error in certification service check:', serviceError);
          // Fall back to prop value on error
          setIsCertified(propIsCertified);
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

  // For debugging
  console.log(`BookMachineButton for ${machineId}:`, {
    propIsCertified,
    isCertified,
    machineStatus,
    requiresCertification
  });

  const isAvailable = machineStatus?.toLowerCase() === 'available';
  // If certification is not required, consider the user as certified
  const effectiveCertification = requiresCertification ? isCertified : true;
  // Simplified condition: machine must be available and not in an unavailable time slot
  const canBook = isAvailable && !timeSlotUnavailable;
  
  const handleBooking = () => {
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
        description: "You need to be certified to book this machine. Please take the course and quiz first.",
        variant: "destructive"
      });
      navigate(`/machine/${machineId}`);
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

  // Debug logs to trace button rendering
  console.log(`BookMachineButton final state for machine ${machineId}:`, {
    isCertified,
    propIsCertified,
    isAvailable,
    requiresCertification,
    effectiveCertification,
    canBook
  });

  // Always show either the "Book Now" button or a button with appropriate message
  if (timeSlotUnavailable) {
    return (
      <Button 
        onClick={handleBooking} 
        disabled={true}
        className={className}
        size={size}
        variant="outline"
      >
        <CalendarX className="mr-2 h-4 w-4" />
        Time Slot Unavailable
      </Button>
    );
  } 
  
  if (!isAvailable) {
    return (
      <Button 
        onClick={handleBooking} 
        disabled={true}
        className={className}
        size={size}
        variant="outline"
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Machine Unavailable
      </Button>
    );
  } 

  // Always show "Book Now" button regardless of certification status
  return (
    <Button 
      onClick={handleBooking} 
      className={className}
      size={size}
      disabled={requiresCertification && !effectiveCertification}
      variant={effectiveCertification ? "default" : "outline"}
    >
      <Calendar className="mr-2 h-4 w-4" />
      Book Now
    </Button>
  );
};

export default BookMachineButton;
