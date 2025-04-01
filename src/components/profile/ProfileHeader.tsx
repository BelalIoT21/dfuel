
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, ArrowLeft, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ProfileHeader = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Wrap the useAuth call in a try-catch to handle the case when AuthProvider is not available
  let user = null;
  let logout = async () => false;
  
  try {
    const auth = useAuth();
    user = auth.user;
    logout = auth.logout;
  } catch (error) {
    console.error('Error using Auth context in ProfileHeader:', error);
  }
  
  // Use the correct path for admins
  const redirectPath = user?.isAdmin ? '/admin' : '/home';

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const success = await logout();
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Logout Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-1">
      <Link 
        to={redirectPath} 
        className="text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-2 text-sm sm:text-base py-1.5 font-medium"
      >
        <ArrowLeft size={18} className="flex-shrink-0" />
        <span>Back to Dashboard</span>
      </Link>
      <Button 
        variant="outline" 
        onClick={handleLogout} 
        disabled={isLoggingOut}
        className="border-purple-200 hover:bg-purple-50 flex items-center gap-2 text-sm w-full sm:w-auto"
        size="sm"
      >
        {isLoggingOut ? (
          <span>Logging out...</span>
        ) : (
          <>
            <LogOut size={16} />
            Logout
          </>
        )}
      </Button>
    </div>
  );
};

export default ProfileHeader;
