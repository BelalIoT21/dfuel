import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { machineService } from '@/services/machineService';
import { bookingService } from '@/services/bookingService';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Loader2 } from 'lucide-react';

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [machine, setMachine] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(timeSlots);

  useEffect(() => {
    async function loadMachine() {
      try {
        if (!id) return;
        setLoading(true);
        setError(null);
        console.log(`Attempting to load machine with ID: ${id}`);
        const foundMachine = await machineService.getMachineById(id);
        if (foundMachine) {
          console.log(`Successfully loaded machine:`, foundMachine);
          setMachine(foundMachine);
          
          // Fetch existing bookings to determine availability
          const allBookings = await bookingService.getAllBookings();
          const machineBookings = allBookings.filter(
            booking => booking.machineId === id || booking.machine === id && 
            (booking.status === 'Approved' || booking.status === 'Pending')
          );
          
          // Create a list of booked slots in format "YYYY-MM-DD-HH:MM AM/PM"
          const bookedDateTimeSlots = machineBookings.map(booking => 
            `${booking.date}-${booking.time}`
          );
          setBookedSlots(bookedDateTimeSlots);
          
          // Update available time slots when date changes
          updateAvailableTimeSlots(selectedDate);
        } else {
          console.error(`Machine not found with ID: ${id}`);
          setError('Machine not found');
        }
      } catch (err) {
        console.error('Error loading machine:', err);
        setError('Failed to load machine details');
      } finally {
        setLoading(false);
      }
    }
    
    loadMachine();
  }, [id]);

  useEffect(() => {
    updateAvailableTimeSlots(selectedDate);
  }, [selectedDate, bookedSlots]);
  
  const updateAvailableTimeSlots = (date: Date | undefined) => {
    if (!date) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Filter out already booked time slots for this date
    const available = timeSlots.filter(time => {
      const dateTimeSlot = `${formattedDate}-${time}`;
      return !bookedSlots.includes(dateTimeSlot);
    });
    
    setAvailableTimeSlots(available);
    
    // If currently selected time is no longer available, reset it
    if (selectedTime && !available.includes(selectedTime)) {
      setSelectedTime('');
    }
  };

  const handleBooking = async () => {
    if (!user || !machine || !selectedDate || !selectedTime) {
      console.error('Missing booking information:', {
        user: !!user,
        machine: !!machine,
        selectedDate: !!selectedDate,
        selectedTime: !!selectedTime
      });
      
      toast({
        title: 'Missing information',
        description: 'Please select a date and time for your booking',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Ensure date is properly formatted
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      console.log('Submitting booking with data:', {
        userId: user.id,
        machineId: machine.id || machine._id,
        date: formattedDate,
        time: selectedTime,
        machineName: machine.name
      });
      
      const success = await bookingService.createBooking(
        user.id,
        machine.id || machine._id,
        formattedDate,
        selectedTime
      );
      
      if (success) {
        toast({
          title: 'Booking Successful',
          description: `You have booked ${machine.name} on ${formattedDate} at ${selectedTime}`,
        });
        navigate('/profile');
      } else {
        setError('Failed to create booking. Please try again.');
        toast({
          title: 'Booking Failed',
          description: 'Unable to create your booking. Please try again later.',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error booking machine:', err);
      setError('An unexpected error occurred. Please try again.');
      toast({
        title: 'Booking Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      if (id) {
        machineService.getMachineById(id)
          .then(data => {
            if (data) {
              setMachine(data);
              setLoading(false);
            } else {
              setError('Machine not found');
              setLoading(false);
            }
          })
          .catch((error) => {
            console.error("Error in retry:", error);
            setError('Failed to load machine details');
            setLoading(false);
          });
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading booking information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetry} variant="outline">
              Retry
            </Button>
            <Button onClick={() => navigate('/home')}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Machine Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find the machine you're looking for.</p>
          <Button onClick={() => navigate('/home')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 py-8">
      <Button
        variant="ghost"
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      
      <Card className="shadow-lg border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
          <CardTitle className="text-2xl text-purple-800">{machine?.name} Booking</CardTitle>
          <CardDescription>
            Select a date and time to book {machine?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Select Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border rounded-md p-3"
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Select Time</h3>
              {availableTimeSlots.length > 0 ? (
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-center">
                  <p className="text-gray-500">No available time slots for this date</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto" 
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime || submitting || availableTimeSlots.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingPage;
