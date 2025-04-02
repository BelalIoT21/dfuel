import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarX, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
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
  
  // For debugging
  useEffect(() => {
    console.log(`BookMachineButton for machine ${machineId}:`, {
      propIsCertified,
      requiresCertification,
      machineStatus,
      currentIsCertified: isCertified
    });
  }, [machineId, propIsCertified, requiresCertification, machineStatus, isCertified]);
  
  // Re-check certification status directly from the database when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const verifyCertification = async () => {
      if (!user || !user.id || !requiresCertification || isVerifying) return;
      
      try {
        setIsVerifying(true);
        console.log(`Verifying certification for user ${user.id} and machine ${machineId}`);
        
        // Check localStorage first for quick rendering
        const cachedCertKey = `user_${user.id}_certification_${machineId}`;
        const cachedCertValue = localStorage.getItem(cachedCertKey);
        
        if (cachedCertValue === 'true' && isMounted) {
          console.log(`BookMachineButton: Using cached certification status for machine ${machineId}`);
          setIsCertified(true);
          setIsVerifying(false);
          return; // Exit early with cached value
        }
        
        // First try to check if the certification is in user object if available
        if (user.certifications && Array.isArray(user.certifications)) {
          const certIds = user.certifications.map(cert => String(cert));
          console.log(`User certifications from context:`, certIds);
          const hasCert = certIds.includes(String(machineId));
          if (hasCert && isMounted) {
            console.log(`BookMachineButton: User has certification from user object for machine ${machineId}`);
            setIsCertified(true);
            localStorage.setItem(cachedCertKey, 'true');
            setIsVerifying(false);
            return;
          }
        }
        
        // Make a direct API call to check certification
        try {
          const apiUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5000', ':4000');
          const response = await fetch(`${apiUrl}/api/certifications/check/${user.id}/${machineId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const hasCert = await response.json();
            console.log(`API certification check for machine ${machineId}: ${hasCert}`);
            
            if (isMounted) {
              setIsCertified(!!hasCert);
              if (hasCert) {
                localStorage.setItem(cachedCertKey, 'true');
              }
            }
            setIsVerifying(false);
            return;
          }
        } catch (apiError) {
          console.error("Direct API call failed:", apiError);
        }
        
        // Use improved certification service with better error handling and caching
        const hasCertFromService = await certificationService.checkCertification(user.id, machineId);
        
        if (isMounted) {
          console.log(`BookMachineButton: Service check - User ${hasCertFromService ? 'has' : 'does not have'} certification for machine ${machineId}`);
          setIsCertified(hasCertFromService);
          if (hasCertFromService) {
            localStorage.setItem(cachedCertKey, 'true');
          }
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
    console.log(`Machine ${machineId} is not bookable, not rendering button`);
    return null;
  }

  const isAvailable = machineStatus?.toLowerCase() === 'available';
  // If certification is not required, consider the user as certified
  const effectiveCertification = requiresCertification ? isCertified : true;
  const canBook = effectiveCertification && isAvailable && !timeSlotUnavailable;
  
  console.log(`Machine ${machineId} booking state:`, {
    isAvailable,
    effectiveCertification,
    canBook,
    timeSlotUnavailable
  });
  
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
      
      if (requiresCertification && !isCertified) {
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
  } else if (requiresCertification && !isCertified) {
    buttonText = "Certification Required";
    ButtonIcon = AlertTriangle; 
  }

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
