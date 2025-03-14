
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface SafetyAlertProps {
  safetyCourseCompleted: boolean;
}

const SafetyAlert = ({ safetyCourseCompleted }: SafetyAlertProps) => {
  const navigate = useNavigate();
  
  if (safetyCourseCompleted) {
    return null;
  }
  
  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800 mb-1">Safety Course Required</h3>
            <p className="text-yellow-700 mb-4">
              All machines are locked until you complete the required safety course.
            </p>
            <Button 
              onClick={() => navigate('/course/safety-course')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Take Safety Course
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyAlert;
