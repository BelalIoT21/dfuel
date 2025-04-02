
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface CourseSlideViewerProps {
  slides: any[];
  onComplete?: () => void;
  initialSlide?: number;
}

export const CourseSlideViewer: React.FC<CourseSlideViewerProps> = ({
  slides = [],
  onComplete,
  initialSlide = 0
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [completed, setCompleted] = useState(false);
  
  useEffect(() => {
    // Reset completed state when slides change
    setCompleted(false);
  }, [slides]);
  
  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCompleted(true);
      onComplete?.();
    }
  };
  
  const isLastSlide = currentSlide === slides.length - 1;
  
  if (!slides || slides.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No course content available.</p>
        </CardContent>
      </Card>
    );
  }
  
  const renderSlideContent = (slide: any) => {
    if (!slide) return null;
    
    if (typeof slide === 'string') {
      return <ReactMarkdown>{slide}</ReactMarkdown>;
    }
    
    const { title, content, image } = slide;
    
    return (
      <>
        {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
        {content && <ReactMarkdown>{content}</ReactMarkdown>}
        {image && (
          <div className="my-4">
            <img 
              src={image} 
              alt={title || 'Course image'} 
              className="max-w-full rounded-md"
            />
          </div>
        )}
      </>
    );
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="min-h-[300px] mb-4">
          {renderSlideContent(slides[currentSlide])}
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className="mr-2"
            >
              <ChevronLeft className="mr-1" />
              Previous
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Slide {currentSlide + 1} of {slides.length}
          </div>
          
          <div>
            <Button onClick={handleNext}>
              {isLastSlide ? 'Finish' : 'Next'}
              {!isLastSlide && <ChevronRight className="ml-1" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseSlideViewer;
