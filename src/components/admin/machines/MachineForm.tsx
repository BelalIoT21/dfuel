
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courseDatabaseService } from '@/services/database/courseService';
import { quizDatabaseService } from '@/services/database/quizService';
import { Asterisk } from 'lucide-react';
import FileUpload from '../common/FileUpload';
import { useToast } from '@/hooks/use-toast';

export interface MachineFormData {
  name: string;
  description: string;
  type: string;
  status: string;
  requiresCertification: boolean;
  difficulty: string;
  imageUrl: string;
  details?: string;
  specifications?: string;
  certificationInstructions?: string;
  linkedCourseId?: string;
  linkedQuizId?: string;
  _id?: string;
}

interface MachineFormProps {
  formData: MachineFormData;
  setFormData: React.Dispatch<React.SetStateAction<MachineFormData>>;
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

const MachineForm: React.FC<MachineFormProps> = ({
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  onCancel,
  title,
  description,
  submitLabel,
}) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Debug log to see the current form data
  useEffect(() => {
    console.log("Current form data:", {
      ...formData,
      requiresCertification: `${formData.requiresCertification} (${typeof formData.requiresCertification})`,
      linkedCourseId: formData.linkedCourseId || "none",
      linkedQuizId: formData.linkedQuizId || "none"
    });
  }, [formData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedCourses, fetchedQuizzes] = await Promise.all([
          courseDatabaseService.getAllCourses(),
          quizDatabaseService.getAllQuizzes()
        ]);
        
        const sortedCourses = (fetchedCourses || []).sort((a, b) => {
          const idA = parseInt(a._id || a.id) || 0;
          const idB = parseInt(b._id || b.id) || 0;
          return idA - idB;
        });
        
        const sortedQuizzes = (fetchedQuizzes || []).sort((a, b) => {
          const idA = parseInt(a._id || a.id) || 0;
          const idB = parseInt(b._id || b.id) || 0;
          return idA - idB;
        });
        
        setCourses(sortedCourses);
        setQuizzes(sortedQuizzes);
        
        console.log('Fetched courses:', sortedCourses.map(c => `${c._id || c.id}: ${c.title}`));
        console.log('Fetched quizzes:', sortedQuizzes.map(q => `${q._id || q.id}: ${q.title}`));
      } catch (error) {
        console.error("Error fetching data for machine form:", error);
        toast({
          title: "Error",
          description: "Failed to load courses and quizzes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    let finalValue = value;
    if ((id === 'linkedCourseId' || id === 'linkedQuizId') && value === 'none') {
      finalValue = '';
    }
    
    console.log(`Setting ${id} to:`, finalValue);
    setFormData((prev) => ({ ...prev, [id]: finalValue }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    console.log(`Setting ${id} to:`, checked, typeof checked);
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };

  const handleImageChange = (dataUrl: string | null) => {
    console.log("Image changed:", dataUrl ? `[data URL of ${dataUrl.length} bytes]` : 'null');
    setFormData(prev => ({
      ...prev,
      imageUrl: dataUrl || ''
    }));
  };

  const getRecommendedCourse = () => {
    if (!formData._id) return null;
    
    if (formData._id === "1") {
      return courses.find(course => course._id === "1" || course.id === "1");
    } else if (formData._id === "2") {
      return courses.find(course => course._id === "2" || course.id === "2");
    } else if (formData._id === "3") {
      return courses.find(course => course._id === "3" || course.id === "3");
    } else if (formData._id === "4") {
      return courses.find(course => course._id === "4" || course.id === "4");
    }
    
    return null;
  };

  const getRecommendedQuiz = () => {
    if (!formData._id) return null;
    
    if (formData._id === "1") {
      return quizzes.find(quiz => quiz._id === "1" || quiz.id === "1");
    } else if (formData._id === "2") {
      return quizzes.find(quiz => quiz._id === "2" || quiz.id === "2");
    } else if (formData._id === "3") {
      return quizzes.find(quiz => quiz._id === "3" || quiz.id === "3");
    } else if (formData._id === "4") {
      return quizzes.find(quiz => quiz._id === "4" || quiz.id === "4");
    }
    
    return null;
  };

  const handleSubmit = () => {
    // Explicitly convert requiresCertification to boolean before submitting
    const finalFormData = {
      ...formData,
      requiresCertification: Boolean(formData.requiresCertification)
    };
    
    console.log("Submitting form data:", {
      ...finalFormData,
      requiresCertification: `${finalFormData.requiresCertification} (${typeof finalFormData.requiresCertification})`,
    });
    
    // Update the form data with the proper boolean value
    setFormData(finalFormData);
    
    // Now submit the form
    onSubmit();
  };

  const suggestedCourse = getRecommendedCourse();
  const suggestedQuiz = getRecommendedQuiz();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="certification">Certification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <RequiredFieldLabel htmlFor="name">Machine Name</RequiredFieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter machine name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <RequiredFieldLabel htmlFor="type">Machine Type</RequiredFieldLabel>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select machine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Machine">Machine</SelectItem>
                  <SelectItem value="Laser Cutter">Laser Cutter</SelectItem>
                  <SelectItem value="3D Printer">3D Printer</SelectItem>
                  <SelectItem value="CNC">CNC</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Woodworking">Woodworking</SelectItem>
                  <SelectItem value="Metalworking">Metalworking</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <RequiredFieldLabel htmlFor="description">Description</RequiredFieldLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter machine description"
                required
              />
            </div>
            
            <div className="space-y-2">
              <RequiredFieldLabel htmlFor="status">Status</RequiredFieldLabel>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Out of Order">Out of Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <RequiredFieldLabel htmlFor="difficulty">Difficulty Level</RequiredFieldLabel>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => handleSelectChange('difficulty', value)}
                required
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
              <Label htmlFor="imageUpload">Machine Image</Label>
              <FileUpload
                existingUrl={formData.imageUrl}
                onFileChange={handleImageChange}
                label="Upload Machine Image"
              />
              {formData._id && formData._id >= "1" && formData._id <= "4" && !formData.imageUrl && (
                <p className="text-xs text-amber-600 mt-1">
                  This is a standard machine that should have a default image.
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="details">Detailed Description</Label>
              <Textarea
                id="details"
                value={formData.details || ''}
                onChange={handleInputChange}
                placeholder="Enter detailed information about the machine"
                className="min-h-[150px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specifications">Technical Specifications</Label>
              <Textarea
                id="specifications"
                value={formData.specifications || ''}
                onChange={handleInputChange}
                placeholder="Enter technical specifications, dimensions, power requirements, etc."
                className="min-h-[150px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="certification" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresCertification"
                    checked={formData.requiresCertification}
                    onCheckedChange={(checked) => handleSwitchChange('requiresCertification', checked)}
                  />
                  <Label htmlFor="requiresCertification" className="cursor-pointer">Requires Certification</Label>
                </div>
                <div className="text-xs text-gray-500">
                  Current value: {formData.requiresCertification ? 'Yes' : 'No'} ({typeof formData.requiresCertification})
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="certificationInstructions">Certification Instructions</Label>
              <Textarea
                id="certificationInstructions"
                value={formData.certificationInstructions || ''}
                onChange={handleInputChange}
                placeholder="Enter instructions for certification process"
                className="min-h-[100px]"
              />
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading courses and quizzes...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="linkedCourseId">Linked Safety Course</Label>
                  <Select
                    value={formData.linkedCourseId || "none"}
                    onValueChange={(value) => handleSelectChange('linkedCourseId', value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a course (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none">None</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course._id || course.id} value={course._id || course.id}>
                          {course.title}
                          {suggestedCourse && suggestedCourse._id === (course._id || course.id) ? " (Recommended)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {suggestedCourse && !formData.linkedCourseId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended course: {suggestedCourse.title}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedQuizId">Linked Certification Quiz</Label>
                  <Select
                    value={formData.linkedQuizId || "none"}
                    onValueChange={(value) => handleSelectChange('linkedQuizId', value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a quiz (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none">None</SelectItem>
                      {quizzes.map((quiz) => (
                        <SelectItem key={quiz._id || quiz.id} value={quiz._id || quiz.id}>
                          {quiz.title}
                          {suggestedQuiz && suggestedQuiz._id === (quiz._id || quiz.id) ? " (Recommended)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {suggestedQuiz && !formData.linkedQuizId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended quiz: {suggestedQuiz.title}
                    </p>
                  )}
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

export default MachineForm;
