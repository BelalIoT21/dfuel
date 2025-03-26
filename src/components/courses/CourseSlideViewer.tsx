
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Slide } from '../admin/courses/CourseSlideEditor';

interface CourseSlideViewerProps {
  slides: Slide[];
}

const CourseSlideViewer: React.FC<CourseSlideViewerProps> = ({ slides }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  
  const currentSlide = slides[currentSlideIndex] || null;
  
  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const renderSlideContent = () => {
    if (!currentSlide) return null;
    
    switch (currentSlide.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <p>{currentSlide.content}</p>
          </div>
        );
        
      case 'heading':
        return currentSlide.headingLevel === 1 ? (
          <h1 className="text-2xl font-bold mb-4">{currentSlide.content}</h1>
        ) : (
          <h2 className="text-xl font-semibold mb-3">{currentSlide.content}</h2>
        );
        
      case 'image':
        return (
          <div className="flex flex-col items-center">
            <img 
              src={currentSlide.content} 
              alt="Course content" 
              className="max-w-full max-h-[400px] object-contain" 
            />
          </div>
        );
        
      case 'video':
        return (
          <div className="flex justify-center">
            <video 
              src={currentSlide.content} 
              controls 
              className="max-w-full max-h-[400px]"
            />
          </div>
        );
        
      default:
        return <p>Unknown slide type</p>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToPrevSlide}
          disabled={currentSlideIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        
        <span className="text-sm text-gray-500">
          Slide {currentSlideIndex + 1} of {slides.length}
        </span>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToNextSlide}
          disabled={currentSlideIndex === slides.length - 1}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <Card className="shadow-md">
        <CardContent className="p-6">
          {renderSlideContent()}
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-1">
          {slides.map((_, index) => (
            <Button 
              key={index}
              variant={index === currentSlideIndex ? "default" : "outline"}
              size="icon"
              className="h-2 w-2 rounded-full p-0"
              onClick={() => setCurrentSlideIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseSlideViewer;
