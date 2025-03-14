
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackToAdminButton = ({ isDashboardLink = true }) => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="outline" 
      className="mb-4 border-purple-200 hover:bg-purple-50 text-sm flex items-center gap-2"
      onClick={() => navigate(isDashboardLink ? '/admin' : '/dashboard')}
    >
      <ArrowLeft size={16} />
      Back to {isDashboardLink ? 'Admin' : 'Dashboard'}
    </Button>
  );
};
