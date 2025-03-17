
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle } from 'lucide-react';
import { courses, machines } from '../utils/data';
import { useToast } from '@/hooks/use-toast';

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const machine = machines.find(m => m.id === id);
  const course = courses[id as keyof typeof courses];
  
  if (!machine || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link to="/home">
            <Button className="bg-purple-600 hover:bg-purple-700">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalSlides = course.slides.length;
  const progress = Math.round(((currentSlide + 1) / totalSlides) * 100);

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    // In a real app, this would call an API to mark the course as completed
    toast({
      title: "Course completed",
      description: "You can now take the safety quiz."
    });
    navigate(`/quiz/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to={`/machine/${id}`} className="text-purple-600 hover:underline flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to {machine.name}
          </Link>
          <div className="text-sm text-gray-500">Slide {currentSlide + 1} of {totalSlides}</div>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold">{course.title}</h1>
        </div>
        <p className="text-gray-600 mb-6">Duration: {course.duration}</p>
        <Progress value={progress} className="mb-8 h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
        
        <Card className="overflow-hidden shadow-lg border-purple-100">
          <CardContent className="p-0">
            <div className="relative">
              {/* Slide Content */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <img 
                  src={course.slides[currentSlide].image} 
                  alt={course.slides[currentSlide].title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Navigation Arrows */}
              {currentSlide > 0 && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white shadow-md"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              {currentSlide < totalSlides - 1 && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white shadow-md"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{course.slides[currentSlide].title}</h2>
              <p className="text-gray-700 mb-8 leading-relaxed">{course.slides[currentSlide].content}</p>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentSlide === 0}
                  className="border-purple-200 text-purple-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentSlide < totalSlides - 1 ? (
                  <Button 
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Complete Course
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Course;
