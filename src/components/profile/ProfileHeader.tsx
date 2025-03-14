
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProfileHeader = () => {
  const { user, logout } = useAuth();
  const redirectPath = user?.isAdmin ? '/admin' : '/home';

  return (
    <div className="mb-6 flex justify-between items-center">
      <Link to={redirectPath} className="text-purple-600 hover:underline flex items-center gap-1">
        &larr; Back to Dashboard
      </Link>
      <Button variant="outline" onClick={logout} className="border-purple-200 hover:bg-purple-50">
        Logout
      </Button>
    </div>
  );
};

export default ProfileHeader;
