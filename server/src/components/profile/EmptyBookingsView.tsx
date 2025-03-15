
import React from 'react';
import { Button } from '../ui/button';
import { CalendarPlus } from 'lucide-react';

const EmptyBookingsView = ({ onBookMachine }: { onBookMachine: () => void }) => {
  return (
    <div className="text-center py-10 px-4 space-y-6">
      <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-purple-100 mb-4">
        <CalendarPlus size={32} className="text-purple-600" />
      </div>
      <h3 className="text-xl font-medium text-gray-800">No Bookings Found</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        You don't have any machine reservations yet. Book a machine to get started with our facilities.
      </p>
      <Button 
        className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 mx-auto mt-4 px-6 py-2.5" 
        onClick={onBookMachine}
      >
        <CalendarPlus size={18} />
        Book a Machine
      </Button>
    </div>
  );
};

export default EmptyBookingsView;
