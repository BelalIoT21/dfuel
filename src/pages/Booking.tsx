
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { machines } from '../utils/data';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';

const timeSlots = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
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

  if (!machine.quizPassed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
        <div className="max-w-xl mx-auto text-center page-transition">
          <h1 className="text-2xl font-bold mb-4">Quiz Required</h1>
          <p className="mb-6">You need to pass the safety quiz before booking this machine.</p>
          <div className="flex gap-4 justify-center">
            <Link to={`/quiz/${id}`}>
              <Button>Take Quiz</Button>
            </Link>
            <Link to={`/machine/${id}`}>
              <Button variant="outline">Back to Machine</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedDate || !selectedTimeSlot) return;
    
    // In a real app, this would call an API to create a booking
    toast({
      title: "Booking Confirmed",
      description: `Your booking for ${machine.name} on ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTimeSlot} has been confirmed.`,
    });
    
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <div className="mb-6">
          <Link to={`/machine/${id}`} className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to {machine.name}
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Book {machine.name}</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                fromDate={new Date()}
                toDate={addDays(new Date(), 30)}
                disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
                className="rounded-md border mx-auto"
              />
            </CardContent>
          </Card>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTimeSlot === slot ? "default" : "outline"}
                      onClick={() => setSelectedTimeSlot(slot)}
                      disabled={!selectedDate}
                      className="justify-start"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
                {!selectedDate && (
                  <p className="text-sm text-gray-500 mt-4">Please select a date first</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Machine</h3>
                    <p>{machine.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Date</h3>
                    <p>{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Not selected'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Time</h3>
                    <p>{selectedTimeSlot || 'Not selected'}</p>
                  </div>
                  
                  <Button 
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTimeSlot}
                    className="w-full mt-4"
                  >
                    Confirm Booking
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Payment will be collected on-site
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
