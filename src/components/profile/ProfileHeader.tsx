
import React from 'react';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfileHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const redirectPath = user?.isAdmin ? '/admin/dashboard' : '/home';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="mb-6 flex justify-between items-center">
      <Link to={redirectPath} className="text-purple-600 hover:underline flex items-center gap-1">
        &larr; Back to {user?.isAdmin ? 'Admin Dashboard' : 'Dashboard'}
      </Link>
      <Button variant="outline" onClick={handleLogout} className="border-purple-200 hover:bg-purple-50">
        Logout
      </Button>
    </div>
  );
};

export default ProfileHeader;
