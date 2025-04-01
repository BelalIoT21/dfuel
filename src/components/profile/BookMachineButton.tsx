
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface BookMachineButtonProps {
  machineId: string;
  isCertified: boolean;
  machineStatus: string;
  requiresCertification?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

const BookMachineButton = ({ 
  machineId, 
  isCertified, 
  machineStatus, 
  requiresCertification = true,
  className = '',
  size = 'default'
}: BookMachineButtonProps) => {
  const navigate = useNavigate();

  const isAvailable = machineStatus?.toLowerCase() === 'available';
  // If certification is not required, consider the user as certified
  const effectiveCertification = requiresCertification ? isCertified : true;
  const canBook = effectiveCertification && isAvailable;
  
  const handleBooking = () => {
    if (!canBook) {
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
    
    console.log(`Attempting to navigate to booking URL for machine ${machineId}`);
    
    try {
      // Ensure we're using the correct path format
      const bookingPath = `/booking/${machineId}`;
      console.log(`Navigating to: ${bookingPath}`);
      
      // Force a hard navigation to the booking page
      window.location.href = bookingPath;
    } catch (error) {
      console.error("Navigation error:", error);
      
      // Fallback to React Router navigation
      navigate(`/booking/${machineId}`);
      
      // Show error toast if navigation fails
      toast({
        title: "Navigation Error",
        description: "There was a problem navigating to the booking page. Please try again.",
        variant: "destructive"
      });
    }
  };

  let buttonText = "Book Now";
  if (!isAvailable) {
    buttonText = "Machine Unavailable";
  } else if (requiresCertification && !isCertified) {
    buttonText = "Certification Required";
  }

  return (
    <Button 
      onClick={handleBooking} 
      disabled={!canBook}
      className={className}
      size={size}
      variant={canBook ? "default" : "outline"}
    >
      <Calendar className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
};

export default BookMachineButton;
