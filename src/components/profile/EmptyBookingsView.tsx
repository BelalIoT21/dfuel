
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, RefreshCw } from 'lucide-react';

const EmptyBookingsView = ({ onBookMachine }) => {
  // Clear any old bookings from localStorage just to be safe
  const cleanLocalStorage = () => {
    try {
      const storedUser = localStorage.getItem('learnit_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure the user has an empty bookings array
        parsedUser.bookings = [];
        localStorage.setItem('learnit_user', JSON.stringify(parsedUser));
        console.log("Cleared any lingering bookings from localStorage");
      }
    } catch (e) {
      console.error("Error cleaning localStorage bookings:", e);
    }
  };

  // Call the cleanup function when this component renders
  React.useEffect(() => {
    cleanLocalStorage();
  }, []);

  return (
    <div className="text-center py-12 px-4 space-y-4">
      <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-purple-100 mb-2">
        <CalendarPlus size={24} className="text-purple-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-800">No Bookings Found</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        You don't have any machine reservations yet. Book a machine to get started.
      </p>
      <Button 
        className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 mx-auto" 
        onClick={onBookMachine}
      >
        <CalendarPlus size={18} />
        Book a Machine
      </Button>
    </div>
  );
};

export default EmptyBookingsView;
