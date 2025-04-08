import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { machineDatabaseService } from '@/services/database/machineService';
import { quizDatabaseService } from '@/services/database/quizService';
import { Asterisk } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import CourseSlideEditor, { Slide } from './CourseSlideEditor';

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  content: string;
  imageUrl?: string;
  relatedMachineIds?: string[];
  quizId?: string;
  difficulty: string;
  slides?: Slide[];
}

interface CourseFormProps {
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  submitLabel: string;
}

const RequiredFieldLabel = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <Label htmlFor={htmlFor} className="flex items-center">
    {children}
    <Asterisk className="h-3 w-3 ml-1 text-red-600" />
  </Label>
);

const CourseForm: React.FC<CourseFormProps> = ({
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  onCancel,
  title,
  description,
  submitLabel,
}) => {
  const [machines, setMachines] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    console.log("FormData slides in CourseForm:", formData.slides);
    
    // Initialize slides from formData if available
    if (formData.slides && Array.isArray(formData.slides) && formData.slides.length > 0) {
      console.log("Setting slides from formData.slides");
      setSlides(formData.slides);
    } else if (formData.content) {
      try {
        // Try to parse slides from content
        console.log("Trying to parse slides from content");
        const parsedSlides = JSON.parse(formData.content);
        if (Array.isArray(parsedSlides) && parsedSlides.length > 0) {
          console.log("Parsed slides from content:", parsedSlides);
          setSlides(parsedSlides);
        } else {
          // If content exists but isn't valid slide array, create a text slide with it
          console.log("Content not a valid slide array, creating default slide");
          setSlides([
            { 
              id: '1', 
              elements: [
                { id: '1-1', type: 'heading', content: formData.title || '', headingLevel: 1 },
                { id: '1-2', type: 'text', content: formData.content }
              ] 
            }
          ]);
        }
      } catch (e) {
        console.error("Error parsing course content:", e);
        // If content exists but isn't valid JSON, create a text slide with it
        setSlides([
          { 
            id: '1', 
            elements: [
              { id: '1-1', type: 'heading', content: formData.title || '', headingLevel: 1 },
              { id: '1-2', type: 'text', content: formData.content }
            ] 
          }
        ]);
      }
    } else {
      // Create a default empty slide
      console.log("Creating default empty slide");
      setSlides([
        { 
          id: '1', 
          elements: [
            { id: '1-1', type: 'heading', content: formData.title || '', headingLevel: 1 }
          ] 
        }
      ]);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedMachines, fetchedQuizzes] = await Promise.all([
          machineDatabaseService.getAllMachines(),
          quizDatabaseService.getAllQuizzes()
        ]);
        
        setMachines(fetchedMachines || []);
        setQuizzes(fetchedQuizzes || []);
      } catch (error) {
        console.error("Error fetching data for course form:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[id]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[id]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleMachineToggle = (machineId: string) => {
    setFormData((prev) => {
      const currentIds = prev.relatedMachineIds || [];
      if (currentIds.includes(machineId)) {
        return { ...prev, relatedMachineIds: currentIds.filter(id => id !== machineId) };
      } else {
        return { ...prev, relatedMachineIds: [...currentIds, machineId] };
      }
    });
  };

  const handleSlidesChange = (newSlides: Slide[]) => {
    console.log("Slides changed to:", newSlides);
    setSlides(newSlides);
    
    // Convert slides to JSON string and store in content field
    const slidesJson = JSON.stringify(newSlides);
    setFormData(prev => ({
      ...prev,
      content: slidesJson,
      slides: newSlides
    }));
  };
  
  const handleImageChange = (dataUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: dataUrl || ''
    }));
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!formData.content) {
      errors.content = "Content is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <RequiredFieldLabel htmlFor="title">Course Title</RequiredFieldLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter course title"
                className={formErrors.title ? "border-red-500" : ""}
              />
              {formErrors.title && (
                <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <RequiredFieldLabel htmlFor="description">Description</RequiredFieldLabel>
              <Input
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && (
                <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fabrication">Fabrication</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => handleSelectChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="courseImage">Course Image</Label>
              <FileUpload
                existingUrl={formData.imageUrl}
                onFileChange={handleImageChange}
                label="Upload Image"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <RequiredFieldLabel htmlFor="content">Course Content</RequiredFieldLabel>
              <CourseSlideEditor 
                slides={slides}
                onChange={handleSlidesChange}
              />
              {formErrors.content && (
                <p className="text-sm text-red-500 mt-1">{formErrors.content}</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="relationships" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Loading related data...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Related Machines</Label>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-3 space-y-2">
                    {machines.length > 0 ? (
                      machines.map((machine) => (
                        <div key={machine._id || machine.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`machine-${machine._id || machine.id}`}
                            checked={(formData.relatedMachineIds || []).includes(machine._id || machine.id)}
                            onChange={() => handleMachineToggle(machine._id || machine.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor={`machine-${machine._id || machine.id}`} className="text-sm">
                            {machine.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No machines available</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quizId">Related Quiz</Label>
                  <Select
                    value={formData.quizId || "none"}
                    onValueChange={(value) => handleSelectChange('quizId', value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quiz (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {quizzes.map((quiz) => (
                        <SelectItem key={quiz._id || quiz.id} value={quiz._id || quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2 pt-4 border-t mt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseForm;
