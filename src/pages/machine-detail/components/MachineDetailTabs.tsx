
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, ChevronRight, Medal, FileText } from "lucide-react";

interface MachineDetailTabsProps {
  description: string;
  specs: Record<string, string>;
  isBookable: boolean;
  courseCompleted: boolean;
  quizPassed: boolean;
  onStartCourse: () => void;
  onStartQuiz: () => void;
  onBookMachine: () => void;
  onPassQuiz: () => void;
  isCertified: boolean;
  isSafetyCabinet?: boolean;
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
  isCertified,
  isSafetyCabinet = false
}: MachineDetailTabsProps) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="certification">Certification</TabsTrigger>
        {isBookable && (
          <TabsTrigger value="booking">Booking</TabsTrigger>
        )}
      </TabsList>
      
      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <p className="text-gray-700">{description}</p>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-gray-500 font-medium min-w-32">{key}:</span>
                <span className="text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
      
      {/* Certification Tab */}
      <TabsContent value="certification" className="space-y-4">
        {isCertified ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <div className="flex items-center gap-3">
              <Medal className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Certification Completed</h3>
                <p className="text-green-700">You are certified to use this machine.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-4">Certification Process</h3>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full w-8 h-8 bg-purple-100 text-purple-700 flex items-center justify-center font-medium">1</div>
                <div>
                  <h4 className="font-medium">{isSafetyCabinet ? "Machine Training" : "Machine Training"}</h4>
                  <p className="text-gray-500 text-sm mb-2">
                    {courseCompleted 
                      ? "Completed" 
                      : `Complete the training course to learn how to use this machine.`}
                  </p>
                  
                  <Button 
                    variant={courseCompleted ? "outline" : "default"}
                    className={courseCompleted ? "border-green-300 text-green-700" : ""}
                    onClick={onStartCourse}
                  >
                    {courseCompleted ? (
                      <>
                        <span className="mr-2">✓</span> Course Completed
                      </>
                    ) : (
                      <>Start Course</>
                    )}
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <div className={`rounded-full w-8 h-8 ${courseCompleted ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"} flex items-center justify-center font-medium`}>2</div>
                <div>
                  <h4 className={`font-medium ${!courseCompleted && "text-gray-400"}`}>Knowledge Quiz</h4>
                  <p className={`text-sm mb-2 ${courseCompleted ? "text-gray-500" : "text-gray-400"}`}>
                    {quizPassed 
                      ? "Passed" 
                      : `Pass the quiz to demonstrate your understanding.`}
                  </p>
                  
                  <Button 
                    variant={quizPassed ? "outline" : "default"}
                    disabled={!courseCompleted}
                    className={quizPassed ? "border-green-300 text-green-700" : !courseCompleted ? "opacity-50 cursor-not-allowed" : ""}
                    onClick={onStartQuiz}
                  >
                    {quizPassed ? (
                      <>
                        <span className="mr-2">✓</span> Quiz Passed
                      </>
                    ) : (
                      <>Start Quiz</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </TabsContent>
      
      {/* Booking Tab */}
      {isBookable && (
        <TabsContent value="booking" className="space-y-4">
          {quizPassed ? (
            <div className="border rounded-md p-5">
              <div className="flex items-start gap-4">
                <CalendarDays className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-medium mb-1">Book this machine</h3>
                  <p className="text-gray-500 mb-4">Reserve time slots to use this machine.</p>
                  
                  <Button onClick={onBookMachine} className="mt-2">
                    Book Now <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-md p-5 bg-gray-50">
              <div className="flex items-start gap-4">
                <FileText className="h-8 w-8 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium mb-1">Certification Required</h3>
                  <p className="text-gray-500 mb-3">You need to complete the certification process before booking this machine.</p>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => document.querySelector('[data-value="certification"]')?.click()}
                    className="text-purple-600 border-purple-200"
                  >
                    Go to Certification
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      )}
    </Tabs>
  );
};
