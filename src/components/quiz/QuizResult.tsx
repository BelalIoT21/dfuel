
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Award, Loader2 } from 'lucide-react';

interface QuizResultProps {
  score: number;
  passed: boolean;
  passingScore: number;
  onRetake: () => void;
  onViewMachine: () => void;
  certificationProcessing: boolean;
  certificationAdded: boolean;
}

const QuizResult: React.FC<QuizResultProps> = ({
  score,
  passed,
  passingScore,
  onRetake,
  onViewMachine,
  certificationProcessing,
  certificationAdded
}) => {
  return (
    <div className="text-center p-4">
      {passed ? (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold text-green-600">Congratulations!</h2>
          <p className="text-lg">You passed the quiz with a score of {score.toFixed(0)}%</p>
          
          {certificationProcessing ? (
            <div className="flex items-center gap-2 text-blue-600 mt-4 bg-blue-50 p-3 px-4 rounded-md">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Processing your certification...</span>
            </div>
          ) : certificationAdded ? (
            <div className="flex items-center gap-2 text-green-600 mt-4 bg-green-50 p-3 px-4 rounded-md">
              <Award className="h-5 w-5" />
              <span className="font-medium">You are now certified to use this machine</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 mt-4 bg-green-50 p-3 px-4 rounded-md">
              <Award className="h-5 w-5" />
              <span className="font-medium">You are now certified to use this machine</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <XCircle className="h-16 w-16 text-red-500" />
          <h2 className="text-2xl font-bold text-red-600">Not Quite There</h2>
          <p className="text-lg">Your score of {score.toFixed(0)}% didn't meet the {passingScore}% passing requirement</p>
          <p className="text-gray-500 mt-2">Review the course material and try again</p>
        </div>
      )}
      
      <div className="flex justify-center gap-3 mt-6">
        <Button 
          variant="outline" 
          onClick={onRetake}
        >
          Retake Quiz
        </Button>
        <Button 
          onClick={onViewMachine}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Return to Machine Page
        </Button>
      </div>
    </div>
  );
};

export default QuizResult;
