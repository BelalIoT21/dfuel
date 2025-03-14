
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const PageHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-purple-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Select a machine to get started</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate('/profile')} 
          className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800"
        >
          My Profile
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
