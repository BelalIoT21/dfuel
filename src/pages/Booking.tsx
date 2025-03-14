
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { machines } from '../utils/data';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'confirmed'>('pending');
  
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const machine = machines.find(m => m.id === id);
  
  // Simulate booking confirmation after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setBookingStatus('confirmed');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!machine || !date || !time) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-3xl mx-auto page-transition">
        <div className="mb-6 flex justify-start">
          <Link to={`/machine/${id}`} className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to {machine.name}
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Booking Confirmation</h1>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Your Booking Details</CardTitle>
            <CardDescription>Review your machine booking information</CardDescription>
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
                      <p className="text-lg font-medium">{date}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Time</h3>
                      <p className="text-lg font-medium">{time}</p>
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
