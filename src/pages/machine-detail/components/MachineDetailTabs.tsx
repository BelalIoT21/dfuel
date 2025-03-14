
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface MachineDetailTabsProps {
  description: string;
  specs: Record<string, any>;
  isBookable: boolean;
  courseCompleted: boolean;
  quizPassed: boolean;
  onStartCourse: () => void;
  onStartQuiz: () => void;
  onBookMachine: () => void;
  onPassQuiz: () => void;
  isCertified: boolean;
}

export const MachineDetailTabs = ({
  description,
  specs,
  isBookable,
  courseCompleted,
  quizPassed,
  onStartCourse,
  onStartQuiz,
  onBookMachine,
  onPassQuiz,
  isCertified
}: MachineDetailTabsProps) => {
  return (
    <Tabs defaultValue="details">
      <TabsList className="mb-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="certification">Certification</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">About this Machine</h3>
          <p className="text-gray-600">
            {description} This specialized equipment requires proper training 
            before use to ensure safety and optimal results.
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Usage Requirements</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>Complete the safety training course</li>
            <li>Pass the certification quiz</li>
            {isBookable && <li>Book machine time in advance</li>}
            <li>Follow all safety protocols</li>
            <li>Report any issues immediately</li>
          </ul>
        </div>
        
        {isBookable && (
          <Button 
            onClick={onBookMachine} 
            disabled={!isCertified}
            className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
          >
            {isCertified ? "Book Machine" : "Get Certified to Book"}
          </Button>
        )}
      </TabsContent>
      
      <TabsContent value="specs">
        <div className="space-y-4">
          <h3 className="font-medium">Technical Specifications</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(specs || {}).map(([key, value]) => (
              <div key={key} className="border rounded-lg p-3">
                <div className="text-sm text-gray-500 capitalize">{key}</div>
                <div className="font-medium">
                  {Array.isArray(value) 
                    ? value.join(', ') 
                    : value.toString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="certification" className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Safety Course</h3>
          <p className="text-gray-600">
            Learn how to safely operate the machine through our comprehensive course.
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <Button 
              onClick={onStartCourse}
              variant={courseCompleted ? "outline" : "default"}
              className={courseCompleted ? "border-purple-200 text-purple-700" : "bg-purple-600 hover:bg-purple-700"}
            >
              {courseCompleted ? "Review Course" : "Start Course"}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Certification Quiz</h3>
          <p className="text-gray-600">
            Demonstrate your knowledge by passing the certification quiz.
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <Button 
              onClick={onStartQuiz}
              variant={quizPassed ? "outline" : "default"}
              disabled={!courseCompleted}
              className={quizPassed ? "border-purple-200 text-purple-700" : "bg-purple-600 hover:bg-purple-700"}
            >
              {quizPassed ? "Review Quiz" : "Start Quiz"}
            </Button>
            
            {courseCompleted && !quizPassed && (
              <Button 
                variant="outline"
                className="border-purple-200 text-purple-700"
                onClick={onPassQuiz}
              >
                (Demo) Mark Quiz Passed
              </Button>
            )}
          </div>
        </div>
        
        {quizPassed && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-3">
            <div className="bg-green-500 text-white p-1 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
            <div>
              <p className="font-medium">Certification Complete!</p>
              <p className="text-sm text-gray-600">You are now certified to use this machine.</p>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
