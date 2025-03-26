
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestionProps {
  question: {
    id?: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  };
  index: number;
  answer: number;
  onAnswerChange: (questionIndex: number, answerIndex: number) => void;
  submitted: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  index, 
  answer, 
  onAnswerChange, 
  submitted 
}) => {
  if (submitted) {
    return (
      <div className="border rounded-md p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 flex-shrink-0 ${
            answer === question.correctAnswer 
              ? 'text-green-500' 
              : 'text-red-500'
          }`}>
            {answer === question.correctAnswer 
              ? <CheckCircle className="h-5 w-5" /> 
              : <XCircle className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <p className="font-medium">{question.question}</p>
            <ul className="mt-2 space-y-1">
              {question.options.map((option, optionIndex) => (
                <li 
                  key={optionIndex} 
                  className={`text-sm py-1 px-2 rounded ${
                    optionIndex === question.correctAnswer 
                      ? 'bg-green-100 text-green-800' 
                      : optionIndex === answer 
                        ? 'bg-red-100 text-red-800' 
                        : ''
                  }`}
                >
                  {option}
                </li>
              ))}
            </ul>
            {question.explanation && (
              <div className="mt-2 text-sm bg-blue-50 p-2 rounded text-blue-700">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4">
      <p className="font-medium mb-4">{question.question}</p>
      <RadioGroup 
        value={answer >= 0 ? answer.toString() : ""} 
        onValueChange={(value) => onAnswerChange(index, parseInt(value))}
      >
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center space-x-2 my-2">
            <RadioGroupItem value={optionIndex.toString()} id={`q${index}-o${optionIndex}`} />
            <Label htmlFor={`q${index}-o${optionIndex}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default QuizQuestion;
