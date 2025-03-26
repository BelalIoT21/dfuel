
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen } from 'lucide-react';

export const AdminHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-purple-800">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Dfuel Platform Management</p>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate('/course/6')} 
          className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 w-full md:w-auto"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Safety Course
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/quiz/6')} 
          className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 w-full md:w-auto"
        >
          <Award className="mr-2 h-4 w-4" />
          Safety Quiz
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/profile')} 
          className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 w-full md:w-auto"
        >
          My Profile
        </Button>
      </div>
    </div>
  );
};
