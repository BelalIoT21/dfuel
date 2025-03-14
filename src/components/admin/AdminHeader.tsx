
import { Button } from '@/components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminHeader = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-purple-800">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Learnit Platform Management</p>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate('/profile')} 
          className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 w-full md:w-auto"
        >
          My Profile
        </Button>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          className="border-red-200 bg-red-100 hover:bg-red-200 text-red-800 w-full md:w-auto"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};
