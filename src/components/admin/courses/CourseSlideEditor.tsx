
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Trash2, Heading1, Heading2, AlignLeft, Image as ImageIcon, Video } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import VideoUpload from '../common/VideoUpload';

export interface Slide {
  id: string;
  type: 'text' | 'image' | 'video' | 'heading';
  content: string;
  headingLevel?: 1 | 2;
}

interface CourseSlideEditorProps {
  slides: Slide[];
  onChange: (slides: Slide[]) => void;
}

const CourseSlideEditor: React.FC<CourseSlideEditorProps> = ({ slides, onChange }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const currentSlide = slides[currentSlideIndex] || null;
  
  const addSlide = (type: Slide['type']) => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type,
      content: '',
      ...(type === 'heading' ? { headingLevel: 1 } : {})
    };
    
    const newSlides = [...slides, newSlide];
    onChange(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
  };
  
  const updateCurrentSlide = (updates: Partial<Slide>) => {
    if (!currentSlide) return;
    
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      ...updates
    };
    
    onChange(updatedSlides);
  };
  
  const deleteCurrentSlide = () => {
    if (slides.length <= 1) {
      // Don't delete the last slide
      return;
    }
    
    const newSlides = slides.filter((_, index) => index !== currentSlideIndex);
    onChange(newSlides);
    
    // Adjust current index if needed
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(Math.max(0, newSlides.length - 1));
    }
  };
  
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
  
  const renderSlideEditor = () => {
    if (!currentSlide) return null;
    
    switch (currentSlide.type) {
      case 'text':
        return (
          <Textarea 
            value={currentSlide.content} 
            onChange={e => updateCurrentSlide({ content: e.target.value })}
            placeholder="Enter text content (supports markdown)"
            className="min-h-[200px]"
          />
        );
        
      case 'heading':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select 
                value={String(currentSlide.headingLevel || 1)} 
                onValueChange={val => updateCurrentSlide({ headingLevel: Number(val) as 1 | 2 })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Heading level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Heading 1</SelectItem>
                  <SelectItem value="2">Heading 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input 
              value={currentSlide.content}
              onChange={e => updateCurrentSlide({ content: e.target.value })}
              placeholder={`Heading ${currentSlide.headingLevel}`}
              className="text-lg font-bold"
            />
          </div>
        );
        
      case 'image':
        return (
          <div className="space-y-4">
            <FileUpload 
              existingUrl={currentSlide.content}
              onFileChange={(dataUrl) => {
                if (dataUrl !== null) {
                  updateCurrentSlide({ content: dataUrl });
                }
              }}
              label="Upload Image"
            />
            {currentSlide.content && (
              <div className="pt-2">
                <Textarea 
                  placeholder="Image caption (optional)"
                  className="text-sm"
                />
              </div>
            )}
          </div>
        );
        
      case 'video':
        return (
          <VideoUpload 
            existingUrl={currentSlide.content}
            onFileChange={(dataUrl) => {
              if (dataUrl !== null) {
                updateCurrentSlide({ content: dataUrl });
              }
            }}
          />
        );
        
      default:
        return <p>Unknown slide type</p>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          {renderSlideEditor()}
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => addSlide('text')}
          className="flex items-center"
        >
          <AlignLeft className="h-4 w-4 mr-2" />
          Add Text
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => addSlide('heading')}
          className="flex items-center"
        >
          <Heading1 className="h-4 w-4 mr-2" />
          Add Heading
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => addSlide('image')}
          className="flex items-center"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add Image
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => addSlide('video')}
          className="flex items-center"
        >
          <Video className="h-4 w-4 mr-2" />
          Add Video
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={deleteCurrentSlide}
          disabled={slides.length <= 1}
          className="ml-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Slide
        </Button>
      </div>
      
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

export default CourseSlideEditor;
