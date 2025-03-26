
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyBookingsView = () => {
  const navigate = useNavigate();

  const handleBookMachine = () => {
    // Navigate to certifications tab instead of booking page
    navigate('/profile?tab=certifications');
  };

  return (
    <div className="text-center py-12">
      <div className="bg-purple-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
        <Calendar className="h-10 w-10 text-purple-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Found</h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        You don't have any machine reservations yet. Book a
        machine to get started with our facilities.
      </p>
      
      <Button
        onClick={handleBookMachine}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Book a Machine
      </Button>
    </div>
  );
};

export default EmptyBookingsView;
