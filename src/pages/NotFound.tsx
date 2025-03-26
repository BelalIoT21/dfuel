
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState('/');
  
  useEffect(() => {
    console.log("NotFound page accessed from path:", location.pathname);
    
    // Determine the appropriate redirect path based on user status and current path
    if (user) {
      if (location.pathname.startsWith('/admin') && user.isAdmin) {
        setRedirectPath('/admin');
      } else if (location.pathname === '/bookings') {
        // If trying to access bookings page directly, don't redirect to home
        // This ensures the bookings page is accessible
        console.log("Accessed bookings page, will not redirect");
        setRedirectPath(user.isAdmin ? '/admin' : '/home');
      } else if (location.pathname.startsWith('/booking/')) {
        // If trying to access a specific booking page
        setRedirectPath('/home');
        console.log("Redirecting from specific booking to home page");
      } else if (user.isAdmin) {
        setRedirectPath('/admin');
      } else {
        setRedirectPath('/home');  
      }
    } else {
      setRedirectPath('/');
    }
  }, [user, location]);

  const handleReturn = () => {
    console.log('Navigating to:', redirectPath);
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button onClick={handleReturn} className="bg-purple-600 hover:bg-purple-700">
          Return to {user?.isAdmin ? 'Admin Dashboard' : user ? 'Dashboard' : 'Home'}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
