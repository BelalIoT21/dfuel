import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Slide, SlideElement, LegacySlide } from '../admin/courses/CourseSlideEditor';

interface CourseSlideViewerProps {
  slides: Slide[] | LegacySlide[];
}

const CourseSlideViewer: React.FC<CourseSlideViewerProps> = ({ slides: propSlides }) => {
  // Convert legacy slide format if needed
  const slides = React.useMemo(() => {
    // Check if the first item has an 'elements' property to determine format
    if (propSlides.length > 0 && 'elements' in propSlides[0]) {
      return propSlides as Slide[];
    } else {
      // Convert from legacy format
      return (propSlides as LegacySlide[]).map(legacySlide => ({
        id: legacySlide.id,
        elements: [{ ...legacySlide, id: `${legacySlide.id}-1` }]
      }));
    }
  }, [propSlides]);

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
  
  const renderElementContent = (element: SlideElement) => {
    if (!element) return null;
    
    switch (element.type) {
      case 'text':
        return (
          <div className="prose max-w-none mb-4">
            <p>{element.content}</p>
          </div>
        );
        
      case 'heading':
        return element.headingLevel === 1 ? (
          <h1 className="text-2xl font-bold mb-4">{element.content}</h1>
        ) : (
          <h2 className="text-xl font-semibold mb-3">{element.content}</h2>
        );
        
      case 'image':
        return (
          <div className="flex flex-col items-center mb-4">
            <img 
              src={element.content} 
              alt="Course content" 
              className="max-w-full max-h-[400px] object-contain" 
            />
          </div>
        );
        
      case 'video':
        return (
          <div className="flex flex-col items-center mb-4">
            <video 
              src={element.content} 
              controls 
              className="max-w-full max-h-[400px]"
              onError={(e) => {
                console.error(`Failed to load video: ${element.content.substring(0, 50)}...`);
                const videoElement = e.target as HTMLVideoElement;
                videoElement.style.display = 'none';
                
                // Create a fallback message
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'p-4 bg-red-50 text-red-700 rounded-md';
                fallbackDiv.textContent = 'Video could not be loaded. Please try a different format (MP4 recommended).';
                
                // Insert the fallback message after the video element
                videoElement.parentNode?.insertBefore(fallbackDiv, videoElement.nextSibling);
              }}
            />
          </div>
        );
        
      default:
        return <p>Unknown element type</p>;
    }
  };
  
  const renderSlideContent = () => {
    if (!currentSlide) return null;
    
    return (
      <div>
        {currentSlide.elements.map((element) => (
          <div key={element.id}>
            {renderElementContent(element)}
          </div>
        ))}
      </div>
    );
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
