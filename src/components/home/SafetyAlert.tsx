
import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface SafetyAlertProps {
  safetyCabinetCompleted: boolean;
  safetyCourseCompleted: boolean;
  allSafetyRequirementsMet: boolean;
}

const SafetyAlert = ({ 
  safetyCabinetCompleted, 
  safetyCourseCompleted, 
  allSafetyRequirementsMet 
}: SafetyAlertProps) => {
  const navigate = useNavigate();
  
  if (allSafetyRequirementsMet) {
    return null;
  }
  
  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
          <div className="w-full">
            <h3 className="font-medium text-yellow-800 mb-1">Safety Requirements</h3>
            <p className="text-yellow-700 mb-4">
              All machines are locked until you complete both safety requirements.
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {safetyCabinetCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-yellow-500" />
                  )}
                  <span className={safetyCabinetCompleted ? "text-green-700" : "text-yellow-700"}>
                    Safety Cabinet Certification
                  </span>
                </div>
                {!safetyCabinetCompleted && (
                  <Button 
                    size="sm"
                    onClick={() => navigate('/machine/safety-cabinet')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Start
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {safetyCourseCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-yellow-500" />
                  )}
                  <span className={safetyCourseCompleted ? "text-green-700" : "text-yellow-700"}>
                    General Safety Course
                  </span>
                </div>
                {!safetyCourseCompleted && (
                  <Button 
                    size="sm"
                    onClick={() => navigate('/machine/safety-course')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Start
                  </Button>
                )}
              </div>
            </div>
            
            {!safetyCabinetCompleted && !safetyCourseCompleted && (
              <Button 
                onClick={() => navigate('/machine/safety-course')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white mr-2"
              >
                Start Safety Course First
              </Button>
            )}
            {safetyCourseCompleted && !safetyCabinetCompleted && (
              <Button 
                onClick={() => navigate('/machine/safety-cabinet')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Complete Safety Cabinet Certification
              </Button>
            )}
            {safetyCabinetCompleted && !safetyCourseCompleted && (
              <Button 
                onClick={() => navigate('/machine/safety-course')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Complete Safety Course
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyAlert;
