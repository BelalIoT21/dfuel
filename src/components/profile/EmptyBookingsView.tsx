
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';

const EmptyBookingsView = ({ onBookMachine }) => {
  return (
    <div className="text-center py-8 space-y-2">
      <p className="text-gray-500 mb-4">You don't have any bookings yet.</p>
      <Button 
        className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2" 
        onClick={onBookMachine}
      >
        <CalendarPlus size={18} />
        Book a Machine
      </Button>
    </div>
  );
};

export default EmptyBookingsView;
