
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookMachineButtonProps {
  machineId: string;
  isCertified: boolean;
  machineStatus: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

const BookMachineButton = ({ 
  machineId, 
  isCertified, 
  machineStatus, 
  className = '',
  size = 'default'
}: BookMachineButtonProps) => {
  const navigate = useNavigate();

  const isAvailable = machineStatus === 'available';
  const canBook = isCertified && isAvailable;
  
  const handleBooking = () => {
    navigate(`/booking/${machineId}`);
  };

  return (
    <Button 
      onClick={handleBooking} 
      disabled={!canBook}
      className={className}
      size={size}
      variant={canBook ? "default" : "outline"}
    >
      <Calendar className="mr-2 h-4 w-4" />
      {canBook ? "Book Now" : isCertified ? "Machine Unavailable" : "Certification Required"}
    </Button>
  );
};

export default BookMachineButton;
