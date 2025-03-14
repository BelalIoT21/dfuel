
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [redirectPath, setRedirectPath] = useState('/');
  
  useEffect(() => {
    // Determine the appropriate redirect path based on user status
    if (user) {
      if (user.isAdmin) {
        setRedirectPath('/admin');
      } else {
        setRedirectPath('/home');  // Changed from '/dashboard' to '/home' to match routes in App.tsx
      }
    } else {
      setRedirectPath('/');
    }
  }, [user]);

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
