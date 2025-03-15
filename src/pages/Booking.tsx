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

// Use short IDs for easier handling
const idMapping: Record<string, string> = {
  "67d5fd3c50bbb3312ae0fb1e": "1", // Laser Cutter
  "67d5fd3c50bbb3312ae0fb1f": "5", // Bambu Lab
  "67d5fd3c50bbb3312ae0fb20": "2", // Ultimaker
  "67d5fd3c50bbb3312ae0fb21": "3", // Safety Cabinet
  "67d5fd3c50bbb3312ae0fb22": "6", // Safety Course
  "67d5fd3c50bbb3312ae0fb23": "4", // Another Bambu Lab
  "67d5fd3c50bbb3312ae0fb24": "7", // X1 E Carbon 3D Printer
};

// Reverse mapping for converting short IDs to MongoDB IDs
const reverseIdMapping: Record<string, string> = {
  "1": "67d5fd3c50bbb3312ae0fb1e", // Laser Cutter
  "5": "67d5fd3c50bbb3312ae0fb1f", // Bambu Lab
  "2": "67d5fd3c50bbb3312ae0fb20", // Ultimaker
  "3": "67d5fd3c50bbb3312ae0fb21", // Safety Cabinet
  "6": "67d5fd3c50bbb3312ae0fb22", // Safety Course
  "4": "67d5fd3c50bbb3312ae0fb23", // Another Bambu Lab
  "7": "67d5fd3c50bbb3312ae0fb24", // X1 E Carbon 3D Printer
};

// Define machine types for consistent identification
const machineTypeMapping: Record<string, string> = {
  "1": "Laser Cutter",
  "2": "3D Printer", // Ultimaker
  "3": "Safety Cabinet",
  "4": "3D Printer", // Bambu Lab
  "5": "3D Printer", // Bambu Lab
  "6": "Safety Course",
  "7": "3D Printer", // X1 E Carbon 3D Printer
};

// Hardcoded machines data for fallback
const hardcodedMachines = {
  "1": { id: "1", name: "Laser Cutter", type: "Laser Cutter" },
  "2": { id: "2", name: "Ultimaker", type: "3D Printer" },
  "3": { id: "3", name: "Safety Cabinet", type: "Safety Cabinet" },
  "4": { id: "4", name: "Bambu Lab X1 E", type: "3D Printer" },
  "5": { id: "5", name: "Bambu Lab X1 E", type: "3D Printer" },
  "6": { id: "6", name: "Machine Safety Course", type: "Safety Course" },
  "7": { id: "7", name: "X1 E Carbon 3D Printer", type: "3D Printer" }
};

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
        
        console.log(`Starting to load machine with ID: ${id}`);
        
        // First try a direct lookup with the given ID (could be short or long)
        let foundMachine = null;
        let machineId = id;
        
        // For simple numeric IDs, try directly with hardcoded data first
        if (id.length <= 2 && hardcodedMachines[id]) {
          console.log(`Found machine in hardcoded data with ID: ${id}`);
          foundMachine = hardcodedMachines[id];
        } 
        // For long MongoDB IDs, try to get the short version
        else if (id.length > 10 && idMapping[id]) {
          machineId = idMapping[id];
          console.log(`Converted long ID ${id} to short ID ${machineId}`);
          foundMachine = hardcodedMachines[machineId];
        }
        
        // If we don't have a machine yet, try the API
        if (!foundMachine) {
          console.log(`Trying API fetch for machine ID: ${machineId}`);
          try {
            // Try with current ID
            foundMachine = await machineService.getMachineById(machineId);
            
            // If that fails and we have a short ID, try with the long version
            if (!foundMachine && machineId.length <= 2 && reverseIdMapping[machineId]) {
              const longId = reverseIdMapping[machineId];
              console.log(`Trying API fetch with long ID: ${longId}`);
              foundMachine = await machineService.getMachineById(longId);
            }
          } catch (apiError) {
            console.error(`API fetch error:`, apiError);
            // Fall back to hardcoded data if API fails
            foundMachine = hardcodedMachines[machineId] || hardcodedMachines[id];
            console.log(`Falling back to hardcoded data: ${foundMachine ? 'success' : 'failed'}`);
          }
        }
        
        // If we still don't have a machine, try one last fallback to hardcoded data
        if (!foundMachine) {
          console.log(`Last resort: trying hardcoded machines for ID: ${id}`);
          foundMachine = hardcodedMachines[id];
        }
        
        // If we found a machine, process it
        if (foundMachine) {
          console.log(`Successfully loaded machine:`, foundMachine);
          
          // Check if it's a non-bookable machine type
          if (foundMachine.type === 'Safety Cabinet' || foundMachine.type === 'Safety Course') {
            setError(`${foundMachine.name} is not bookable. Please select a different machine.`);
            setMachine(foundMachine);
            setLoading(false);
            return;
          }
          
          setMachine(foundMachine);
          
          // Fetch existing bookings to determine availability
          try {
            const allBookings = await bookingService.getAllBookings();
            console.log(`Retrieved ${allBookings.length} bookings`);
            
            // Match bookings to this machine (using both short and long IDs)
            const machineBookings = allBookings.filter(booking => {
              const bookingMachineId = booking.machineId;
              return (
                bookingMachineId === id || 
                bookingMachineId === machineId || 
                bookingMachineId === foundMachine.id ||
                (idMapping[bookingMachineId] && idMapping[bookingMachineId] === machineId) ||
                (reverseIdMapping[bookingMachineId] && reverseIdMapping[bookingMachineId] === machineId)
              ) && (
                booking.status === 'Approved' || booking.status === 'Pending'
              );
            });
            
            // Create a list of booked slots in format "YYYY-MM-DD-HH:MM AM/PM"
            const bookedDateTimeSlots = machineBookings.map(booking => 
              `${booking.date}-${booking.time}`
            );
            setBookedSlots(bookedDateTimeSlots);
            
            // Update available time slots when date changes
            updateAvailableTimeSlots(selectedDate);
          } catch (bookingError) {
            console.error("Error loading bookings:", bookingError);
            // Continue with empty bookings
            setBookedSlots([]);
          }
        } else {
          console.error(`Machine not found with ID: ${id}`);
          setError('Machine not found or is not bookable');
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
      toast({
        title: 'Missing information',
        description: 'Please select a date and time for your booking',
        variant: 'destructive'
      });
      return;
    }
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const dateTimeSlot = `${formattedDate}-${selectedTime}`;
    
    // Double-check if the slot is still available
    if (bookedSlots.includes(dateTimeSlot)) {
      toast({
        title: 'Time slot unavailable',
        description: 'This time slot has just been booked. Please select another time.',
        variant: 'destructive'
      });
      // Refresh available time slots
      updateAvailableTimeSlots(selectedDate);
      return;
    }
    
    try {
      setSubmitting(true);
      console.log('Submitting booking...');
      
      // Use short machine ID (1, 2, etc.) for booking when available
      let bookingMachineId = machine.id || id;
      
      // Ensure we're using a short ID format for consistency
      if (bookingMachineId.length > 5 && idMapping[bookingMachineId]) {
        bookingMachineId = idMapping[bookingMachineId];
      }
      
      console.log(`Creating booking with machine ID: ${bookingMachineId}`);
      
      const success = await bookingService.createBooking(
        user.id,
        bookingMachineId,
        formattedDate,
        selectedTime
      );
      
      if (success) {
        // Add the newly booked slot to the list
        setBookedSlots(prev => [...prev, dateTimeSlot]);
        
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
      window.location.reload(); // Simple reload approach to retry
    }, 1000);
  };

  useEffect(() => {
    if (machine && (machine.type === 'Safety Cabinet' || machine.type === 'Safety Course')) {
      const timeout = setTimeout(() => {
        navigate(`/machine/${machine.id || id}`);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [machine, navigate, id]);

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

  if (machine.type === 'Safety Cabinet' || machine.type === 'Safety Course') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-orange-600 mb-2">Not Bookable</h1>
          <p className="text-gray-600 mb-4">
            {machine.name} is not a bookable resource. You will be redirected to the machine details page.
          </p>
          <Button onClick={() => navigate(`/machine/${machine.id || id}`)}>
            Go to Machine Details
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
          <CardTitle className="text-2xl text-purple-800">{machine.name} Booking</CardTitle>
          <CardDescription>
            Select a date and time to book {machine.name}
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
