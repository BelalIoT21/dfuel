
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { courses, machines, safetyCourse } from '../utils/data';
import { useToast } from '@/hooks/use-toast';

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const isSafetyCourse = id === 'safety-course';
  
  // Get the course content based on the id
  const machine = !isSafetyCourse ? machines.find(m => m.id === id) : null;
  const courseContent = isSafetyCourse 
    ? safetyCourse
    : (id && courses[id as keyof typeof courses] ? courses[id as keyof typeof courses] : null);
  
  if (!courseContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalSlides = courseContent.slides.length;
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
    toast({
      title: "Course completed",
      description: "You can now take the quiz."
    });
    navigate(isSafetyCourse ? '/quiz/safety-course' : `/quiz/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto page-transition">
        <div className="mb-6 flex justify-between items-center">
          <Link to={isSafetyCourse ? "/home" : `/machine/${id}`} className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to {isSafetyCourse ? "Home" : machine?.name}
          </Link>
          <div className="text-sm text-gray-500">Slide {currentSlide + 1} of {totalSlides}</div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{courseContent.title}</h1>
        <p className="text-gray-600 mb-6">Duration: {courseContent.duration}</p>
        <Progress value={progress} className="mb-8" />
        
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {/* Slide Content */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <img 
                  src={courseContent.slides[currentSlide].image} 
                  alt={courseContent.slides[currentSlide].title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Navigation Arrows */}
              {currentSlide > 0 && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              {currentSlide < totalSlides - 1 && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{courseContent.slides[currentSlide].title}</h2>
              <p className="text-gray-700 mb-8">{courseContent.slides[currentSlide].content}</p>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentSlide === 0}
                >
                  Previous
                </Button>
                
                {currentSlide < totalSlides - 1 ? (
                  <Button onClick={handleNext}>Next</Button>
                ) : (
                  <Button onClick={handleComplete}>Complete Course</Button>
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
