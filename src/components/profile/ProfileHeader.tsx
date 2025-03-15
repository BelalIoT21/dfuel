
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, ArrowLeft } from 'lucide-react';

const ProfileHeader = () => {
  const { user, logout } = useAuth();
  const redirectPath = user?.isAdmin ? '/admin' : '/home';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <Link to={redirectPath} className="text-purple-600 hover:underline flex items-center gap-2 text-sm sm:text-base py-1">
        <ArrowLeft size={18} className="flex-shrink-0" />
        <span>Back to Dashboard</span>
      </Link>
      <Button 
        variant="outline" 
        onClick={logout} 
        className="border-purple-200 hover:bg-purple-50 flex items-center gap-2 text-sm w-full sm:w-auto"
        size="sm"
      >
        <LogOut size={16} />
        Logout
      </Button>
    </div>
  );
};

export default ProfileHeader;
