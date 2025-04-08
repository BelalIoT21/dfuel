import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Trash2, Heading1, Heading2, AlignLeft, Image as ImageIcon, Video, PlusCircle } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import VideoUpload from '../common/VideoUpload';

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'heading';
  content: string;
  headingLevel?: 1 | 2;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
}

// Legacy type for backward compatibility
export type LegacySlide = SlideElement;

interface CourseSlideEditorProps {
  slides: Slide[] | LegacySlide[];
  onChange: (slides: Slide[]) => void;
}

const CourseSlideEditor: React.FC<CourseSlideEditorProps> = ({ slides: propSlides, onChange }) => {
  // Convert legacy slide format if needed
  const [slides, setSlides] = useState<Slide[]>(() => {
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
  });
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const currentSlide = slides[currentSlideIndex] || null;
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(
    currentSlide && currentSlide.elements.length > 0 ? 0 : null
  );
  
  // Update parent component when slides change
  const updateParent = (newSlides: Slide[]) => {
    setSlides(newSlides);
    onChange(newSlides);
  };
  
  // Add a new slide
  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      elements: [
        {
          id: `${Date.now()}-1`,
          type: 'heading',
          content: '',
          headingLevel: 1
        }
      ]
    };
    
    const newSlides = [...slides, newSlide];
    updateParent(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
    setActiveElementIndex(0); // Set the new element as active
  };
  
  // Add a new element to the current slide
  const addElement = (type: SlideElement['type']) => {
    if (!currentSlide) return;
    
    const newElement: SlideElement = {
      id: `${currentSlideIndex + 1}-${currentSlide.elements.length + 1}`,
      type,
      content: '',
      ...(type === 'heading' ? { headingLevel: 1 } : {})
    };
    
    const updatedSlide = {
      ...currentSlide,
      elements: [...currentSlide.elements, newElement]
    };
    
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = updatedSlide;
    
    updateParent(updatedSlides);
    setActiveElementIndex(updatedSlide.elements.length - 1); // Set the new element as active
  };
  
  // Update the currently active element
  const updateCurrentElement = (updates: Partial<SlideElement>) => {
    if (!currentSlide || activeElementIndex === null) return;
    
    const updatedElements = [...currentSlide.elements];
    updatedElements[activeElementIndex] = {
      ...updatedElements[activeElementIndex],
      ...updates
    };
    
    const updatedSlide = {
      ...currentSlide,
      elements: updatedElements
    };
    
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = updatedSlide;
    
    updateParent(updatedSlides);
  };
  
  // Delete the currently active element
  const deleteCurrentElement = () => {
    if (!currentSlide || activeElementIndex === null) return;
    
    // Don't delete the last element in a slide
    if (currentSlide.elements.length <= 1) {
      return;
    }
    
    const updatedElements = currentSlide.elements.filter((_, index) => index !== activeElementIndex);
    
    const updatedSlide = {
      ...currentSlide,
      elements: updatedElements
    };
    
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = updatedSlide;
    
    updateParent(updatedSlides);
    
    // Adjust active element index if needed
    if (activeElementIndex >= updatedElements.length) {
      setActiveElementIndex(Math.max(0, updatedElements.length - 1));
    }
  };
  
  // Delete the current slide
  const deleteCurrentSlide = () => {
    if (slides.length <= 1) {
      // Don't delete the last slide
      return;
    }
    
    const newSlides = slides.filter((_, index) => index !== currentSlideIndex);
    updateParent(newSlides);
    
    // Adjust current index if needed
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(Math.max(0, newSlides.length - 1));
    }
    
    // Reset active element index
    setActiveElementIndex(newSlides[Math.max(0, newSlides.length - 1)].elements.length > 0 ? 0 : null);
  };
  
  // Navigation between slides
  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      setActiveElementIndex(slides[currentSlideIndex + 1].elements.length > 0 ? 0 : null);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setActiveElementIndex(slides[currentSlideIndex - 1].elements.length > 0 ? 0 : null);
    }
  };
  
  // Render the editor for the active element
  const renderElementEditor = () => {
    if (!currentSlide || activeElementIndex === null) return null;
    
    const currentElement = currentSlide.elements[activeElementIndex];
    if (!currentElement) return null;
    
    switch (currentElement.type) {
      case 'text':
        return (
          <Textarea 
            value={currentElement.content} 
            onChange={e => updateCurrentElement({ content: e.target.value })}
            placeholder="Enter text content (supports markdown)"
            className="min-h-[200px]"
          />
        );
        
      case 'heading':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select 
                value={String(currentElement.headingLevel || 1)} 
                onValueChange={val => updateCurrentElement({ headingLevel: Number(val) as 1 | 2 })}
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
              value={currentElement.content}
              onChange={e => updateCurrentElement({ content: e.target.value })}
              placeholder={`Heading ${currentElement.headingLevel}`}
              className="text-lg font-bold"
            />
          </div>
        );
        
      case 'image':
        return (
          <div className="space-y-4">
            <FileUpload 
              existingUrl={currentElement.content}
              onFileChange={(dataUrl) => {
                if (dataUrl !== null) {
                  updateCurrentElement({ content: dataUrl });
                }
              }}
              label="Upload Image"
            />
            {currentElement.content && (
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
            existingUrl={currentElement.content}
            onFileChange={(dataUrl) => {
              if (dataUrl !== null) {
                updateCurrentElement({ content: dataUrl });
              }
            }}
          />
        );
        
      default:
        return <p>Unknown element type</p>;
    }
  };
  
  // Render element tabs for the current slide
  const renderElementTabs = () => {
    if (!currentSlide || currentSlide.elements.length === 0) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4 border-b pb-4">
        {currentSlide.elements.map((element, index) => (
          <Button 
            key={element.id}
            variant={index === activeElementIndex ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveElementIndex(index)}
            className="flex items-center gap-1"
          >
            {element.type === 'heading' && <Heading1 className="h-3 w-3" />}
            {element.type === 'text' && <AlignLeft className="h-3 w-3" />}
            {element.type === 'image' && <ImageIcon className="h-3 w-3" />}
            {element.type === 'video' && <Video className="h-3 w-3" />}
            <span>Element {index + 1}</span>
          </Button>
        ))}
      </div>
    );
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
      
      {renderElementTabs()}
      
      <Card>
        <CardContent className="p-4">
          {renderElementEditor()}
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => addElement('text')}
          className="flex items-center"
        >
          <AlignLeft className="h-4 w-4 mr-2" />
          Add Text
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => addElement('heading')}
          className="flex items-center"
        >
          <Heading1 className="h-4 w-4 mr-2" />
          Add Heading
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => addElement('image')}
          className="flex items-center"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add Image
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => addElement('video')}
          className="flex items-center"
        >
          <Video className="h-4 w-4 mr-2" />
          Add Video
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          onClick={addSlide}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
        
        <Button 
          variant="destructive" 
          size="sm"
          onClick={deleteCurrentElement}
          disabled={!currentSlide || currentSlide.elements.length <= 1 || activeElementIndex === null}
          className="ml-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Element
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={deleteCurrentSlide}
          disabled={slides.length <= 1}
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
              onClick={() => {
                setCurrentSlideIndex(index);
                setActiveElementIndex(slides[index].elements.length > 0 ? 0 : null);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseSlideEditor;
