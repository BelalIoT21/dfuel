
import React from 'react';
import { Calendar } from 'lucide-react';

const EmptyBookingsView = () => {
  return (
    <div className="text-center py-12">
      <div className="bg-purple-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
        <Calendar className="h-10 w-10 text-purple-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Found</h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        You don't have any machine reservations yet. Visit the certifications 
        tab to book a machine.
      </p>
    </div>
  );
};

export default EmptyBookingsView;
