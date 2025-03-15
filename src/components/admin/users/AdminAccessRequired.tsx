
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const AdminAccessRequired = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
        <p className="mb-4">You don't have permission to access this page.</p>
        <Link to="/home">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};
