
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    console.log(`Navigating to certification tab for machine ${machineId}`);
    // Navigate to the certifications tab on the profile page
    navigate(`/profile?tab=certifications`);
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
