
import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../src/context/AuthContext';

export const BackToAdminButton = ({ isDashboardLink = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const redirectPath = isDashboardLink 
    ? '/admin'
    : user?.isAdmin 
      ? '/admin' 
      : '/home';
  
  return (
    <Button 
      variant="outline" 
      className="mb-4 border-purple-200 hover:bg-purple-50 text-purple-700 text-sm flex items-center gap-2"
      onClick={() => navigate(redirectPath)}
    >
      <ArrowLeft size={16} />
      Back to {isDashboardLink ? 'Admin' : 'Dashboard'}
    </Button>
  );
};
