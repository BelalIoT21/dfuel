
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { machines } from '../utils/data';
import { format, addDays, isSameDay } from 'date-fns';

// Mock available time slots
const timeSlots = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
];

// Mock bookings data (some slots already booked)
const bookedSlots = {
  '2023-10-15': [0, 3, 6], // Indexes of timeSlots that are booked
  '2023-10-16': [1, 2],
  '2023-10-20': [3, 4, 5],
};

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  
  const machine = machines.find(m => m.id === id);
  
  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Machine not found</h1>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get booked slots for the selected date
  const getBookedSlotsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return bookedSlots[dateKey as keyof typeof bookedSlots] || [];
  };

  const handleBooking = () => {
    if (selectedSlot === null) {
      toast({
        title: "Error",
        description: "Please select a time slot first.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);

    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      toast({
        title: "Booking Confirmed",
        description: `You have booked the ${machine.name} for ${format(selectedDate, 'MMMM d, yyyy')} at ${timeSlots[selectedSlot]}.`
      });
    }, 1500);
  };

  const bookedSlotsForSelectedDate = getBookedSlotsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to={`/machine/${id}`} className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to {machine.name}
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Book {machine.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Select Date</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                disabled={{ before: addDays(new Date(), 1) }}
              />
              <p className="text-sm text-gray-500 mt-4">
                You can book up to 30 days in advance. Bookings require admin approval.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Select Time Slot</h2>
              <p className="text-gray-600 mb-4">
                Time slots for {format(selectedDate, 'MMMM d, yyyy')}:
              </p>
              
              <div className="space-y-3">
                {timeSlots.map((slot, index) => {
                  const isBooked = bookedSlotsForSelectedDate.includes(index);
                  return (
                    <div 
                      key={index} 
                      className={`
                        p-3 border rounded-md cursor-pointer transition
                        ${isBooked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'hover:border-primary'}
                        ${selectedSlot === index && !isBooked ? 'border-primary bg-primary/5' : ''}
                      `}
                      onClick={() => !isBooked && setSelectedSlot(index)}
                    >
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">{slot}</Label>
                        {isBooked ? (
                          <span className="text-xs bg-gray-200 text-gray-700 py-1 px-2 rounded">Booked</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded">Available</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button 
                className="w-full mt-6" 
                onClick={handleBooking}
                disabled={selectedSlot === null || isBooking}
              >
                {isBooking ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Booking Information</h2>
            <div className="space-y-4">
              <div>
                <Label>Selected Machine</Label>
                <p className="font-medium">{machine.name}</p>
              </div>
              
              <div>
                <Label>Date</Label>
                <p className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
              </div>
              
              <div>
                <Label>Time</Label>
                <p className="font-medium">
                  {selectedSlot !== null ? timeSlots[selectedSlot] : 'No time slot selected'}
                </p>
              </div>
              
              <div className="text-sm text-gray-500 border-t pt-4 mt-4">
                <p>Payment will be collected on-site before your session.</p>
                <p>Please arrive 10 minutes before your scheduled time.</p>
                <p>If you need to cancel, please do so at least 24 hours in advance.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
