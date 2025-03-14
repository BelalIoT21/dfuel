
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { machines } from '../utils/data';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addCertification } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const machine = machines.find(m => m.id === id);
  
  // Check if user is certified for this machine
  const isCertified = user?.certifications.includes(id || '');
  
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

  const handleStartCourse = () => {
    navigate(`/course/${id}`);
  };

  const handleTakeQuiz = () => {
    navigate(`/quiz/${id}`);
  };

  const handleCompleteCertification = () => {
    // Mark course as completed and quiz as passed
    if (id) {
      addCertification(id);
    }
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Booking Failed",
        description: "Please select both a date and time.",
        variant: "destructive"
      });
      return;
    }

    // Format date as YYYY-MM-DD
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    // In a real app, this would call an API to create the booking
    toast({
      title: "Booking Requested",
      description: `Your booking for ${formattedDate} at ${selectedTime} has been requested and is pending approval.`
    });
    
    // Navigate to the bookings page or stay on the same page
    navigate(`/booking/${id}?date=${formattedDate}&time=${selectedTime}`);
  };

  // Available time slots (in a real app, this would be fetched from an API)
  const availableTimeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-5xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/home" className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to Machines
          </Link>
          
          <div className="flex items-center gap-2">
            <Badge variant={machine.status === 'available' ? 'default' : 'destructive'}>
              {machine.status === 'available' ? 'Available' : 'Maintenance'}
            </Badge>
            
            {isCertified && (
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                Certified
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{machine.name}</CardTitle>
                <CardDescription>Machine Specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center mb-4">
                  <img 
                    src={machine.image} 
                    alt={machine.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Description</h3>
                  <p>{machine.description}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-500">Specifications</h3>
                  <ul className="text-sm space-y-1">
                    {Object.entries(machine.specs).map(([key, value]) => (
                      <li key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span className="font-medium">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Maintenance</h3>
                  <p className="text-sm">Last maintenance: {machine.maintenanceDate}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue={isCertified ? "booking" : "certification"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="certification">Certification</TabsTrigger>
                <TabsTrigger value="booking" disabled={!isCertified}>Booking</TabsTrigger>
              </TabsList>
              
              <TabsContent value="certification" className="border rounded-md p-6 mt-6">
                {isCertified ? (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4 text-green-500">✓</div>
                    <h2 className="text-2xl font-bold mb-2">You are certified!</h2>
                    <p className="text-gray-600 mb-6">
                      You have completed the safety course and passed the quiz for this machine. 
                      You can now book time to use it.
                    </p>
                    <Button onClick={() => document.querySelector('[data-value="booking"]')?.click()}>
                      Book Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Safety Certification Required</h2>
                      <p className="text-gray-600 mb-4">
                        To use this machine, you must complete the safety course and pass the quiz.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Step 1: Safety Course</CardTitle>
                          <CardDescription>Learn how to safely operate this machine</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 text-sm">
                            The safety course takes approximately 30 minutes to complete.
                            You'll learn about the machine's operation, safety procedures, and maintenance.
                          </p>
                          <Button onClick={handleStartCourse} className="w-full">
                            Start Safety Course
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Step 2: Safety Quiz</CardTitle>
                          <CardDescription>Test your knowledge</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 text-sm">
                            After completing the safety course, take the quiz to demonstrate your understanding.
                            You must score at least 70% to pass.
                          </p>
                          <Button onClick={handleTakeQuiz} className="w-full">
                            Take Safety Quiz
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* For demonstration purposes, add a button to complete certification immediately */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-8 border-t pt-4">
                        <p className="text-sm text-gray-500 mb-2">Development Mode: Quick Certification</p>
                        <Button 
                          variant="outline" 
                          onClick={handleCompleteCertification}
                          className="w-full"
                        >
                          Complete Certification Immediately
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="booking" className="border rounded-md p-6 mt-6">
                {machine.status !== 'available' ? (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4 text-amber-500">⚠️</div>
                    <h2 className="text-2xl font-bold mb-2">Machine Unavailable</h2>
                    <p className="text-gray-600 mb-6">
                      This machine is currently undergoing maintenance and is not available for booking.
                      Please check back later or contact an administrator for more information.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Book Machine Time</h2>
                      <p className="text-gray-600 mb-4">
                        Select a date and time to book this machine. Bookings are subject to approval.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-2 block">Select Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => 
                            date < new Date(new Date().setHours(0,0,0,0)) || // Disable past dates
                            date > new Date(new Date().setDate(new Date().getDate() + 14)) // Only allow 2 weeks in advance
                          }
                          className="border rounded-md"
                        />
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Select Time Slot</Label>
                        <Select
                          value={selectedTime}
                          onValueChange={setSelectedTime}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="mt-8">
                          <Button 
                            onClick={handleBooking} 
                            className="w-full"
                            disabled={!selectedDate || !selectedTime}
                          >
                            Request Booking
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            All bookings require approval from an administrator. You will receive a notification when your booking is approved.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineDetail;
