
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotFoundView = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Machine Not Found</h1>
        <Link to="/home">
          <Button className="bg-purple-600 hover:bg-purple-700">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};
