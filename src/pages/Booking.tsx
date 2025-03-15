
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { machines } from '../utils/data';
import { useAuth } from '../context/AuthContext';
import { bookingDatabaseService } from '../services/database/bookingService';
import { toast } from '../components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

const TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00'
];

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time slot",
  }),
});

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'form' | 'confirmed'>('form');
  const navigate = useNavigate();
  
  const paramDate = searchParams.get('date');
  const paramTime = searchParams.get('time');
  const machine = machines.find(m => m.id === id);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: paramDate ? new Date(paramDate) : undefined,
      time: paramTime || '',
    },
  });

  useEffect(() => {
    // Immediately redirect if we don't have a machine or it's a Safety Cabinet
    if (!machine) {
      navigate('/home');
      return;
    }
    
    // Check if this is a Safety Cabinet - redirect if it is
    if (machine.type === 'Safety Cabinet' || machine.type === 'Equipment') {
      toast({
        title: "Not Bookable",
        description: `${machine.type} is not a bookable resource.`,
        variant: "destructive"
      });
      navigate(`/machine/${id}`);
      return;
    }
    
    if (paramDate && paramTime && user) {
      setBookingStatus('pending');
      processBooking(paramDate, paramTime);
    } else {
      setBookingStatus('form');
    }
  }, [id, paramDate, paramTime, user, machine, navigate]);
  
  const processBooking = async (date: string, time: string) => {
    if (!machine || !user) return;
    
    try {
      console.log(`Processing booking for machine ${machine.id} on ${date} at ${time}`);
      const success = await bookingDatabaseService.addBooking(user.id, machine.id, date, time);
      
      if (success) {
        setBookingStatus('confirmed');
        toast({
          title: "Booking Confirmed",
          description: user.isAdmin ? "Booking was automatically approved" : "Your booking request has been received",
        });
      } else {
        toast({
          title: "Booking Failed",
          description: "There was an error creating your booking",
          variant: "destructive"
        });
        setBookingStatus('form');
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      // Still show confirmation in development/demo mode even if API fails
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        setBookingStatus('confirmed');
        toast({
          title: "Demo Mode: Booking Confirmed",
          description: "This is a demo. In production, this would connect to a real API.",
        });
      } else {
        toast({
          title: "Booking Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
        setBookingStatus('form');
      }
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedDate = format(values.date, 'yyyy-MM-dd');
    setBookingStatus('pending');
    processBooking(formattedDate, values.time);
  };
  
  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Booking Information</h1>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = user?.isAdmin;
  const dashboardLink = isAdmin ? "/admin" : "/home";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-3xl mx-auto page-transition">
        <div className="mb-6 flex justify-start">
          <Link to={dashboardLink} className="text-purple-600 hover:underline flex items-center gap-1">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Book {machine.name}</h1>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Booking {machine.name}</CardTitle>
            <CardDescription>Please select your preferred date and time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {bookingStatus === 'pending' ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 rounded-full border-4 border-t-blue-500 border-opacity-25 animate-spin mb-4"></div>
                <h2 className="text-xl font-bold mb-2">Processing Your Booking</h2>
                <p className="text-gray-600">
                  Please wait while we confirm your booking request...
                </p>
              </div>
            ) : bookingStatus === 'form' ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => 
                              date < new Date() || // Can't book in the past
                              date.getDay() === 0 || // No Sundays
                              date.getDay() === 6    // No Saturdays
                            }
                            className="rounded-md border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Slot</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Book Now
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="text-center pb-6">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-green-600">Booking Confirmed!</h2>
                  <p className="text-gray-600">
                    {isAdmin 
                      ? "Your booking has been automatically approved."
                      : "Your booking request has been received and is pending approval."}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Machine</h3>
                      <p className="text-lg font-medium">{machine.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">User</h3>
                      <p className="text-lg font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date</h3>
                      <p className="text-lg font-medium">{form.getValues().date ? format(form.getValues().date, 'yyyy-MM-dd') : ''}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Time</h3>
                      <p className="text-lg font-medium">{form.getValues().time}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className="text-lg font-medium">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isAdmin 
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {isAdmin ? "Approved" : "Pending Approval"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
                      <p className="text-lg font-medium">{`BK-${Date.now().toString().slice(-6)}`}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-2">What happens next?</h3>
                  <p className="text-gray-600 mb-4">
                    {isAdmin 
                      ? "As an admin, your booking has been automatically approved. You can view all bookings in the admin dashboard."
                      : "An administrator will review your booking request and approve it. You will be notified once your booking is approved. You can view the status of your bookings on your profile page."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild>
                      <Link to={isAdmin ? "/admin/dashboard" : "/profile"}>
                        {isAdmin ? "View Admin Dashboard" : "View All Bookings"}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/home">Return to Home</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
