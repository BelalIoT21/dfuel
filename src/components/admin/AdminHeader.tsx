
import { Button } from '@/components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminHeader = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-purple-800">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Learnit Platform Management</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/profile')} className="border-purple-200 hover:bg-purple-50 text-xs md:text-sm">
          My Profile
        </Button>
        <Button variant="outline" onClick={logout} className="border-purple-200 hover:bg-purple-50 text-xs md:text-sm">
          Logout
        </Button>
      </div>
    </div>
  );
};
