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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    console.log("Current form data:", {
      ...formData,
      requiresCertification: `${formData.requiresCertification} (${typeof formData.requiresCertification})`,
      linkedCourseId: formData.linkedCourseId || "none",
      linkedQuizId: formData.linkedQuizId || "none",
      status: formData.status
    });
    
    // Set initial image preview if one exists
    if (formData.imageUrl && !imagePreview) {
      setImagePreview(formData.imageUrl);
    }
  }, [formData]);

  useEffect(() => {
    if (formData && formData.status) {
      let normalizedStatus = formData.status;
      
      if (formData.status === 'available') {
        normalizedStatus = 'Available';
      } else if (formData.status === 'maintenance') {
        normalizedStatus = 'Maintenance';
      } else if (formData.status === 'in-use' || formData.status === 'in use') {
        normalizedStatus = 'Out of Order';
      }
      
      if (normalizedStatus !== formData.status) {
        console.log(`Normalizing status from "${formData.status}" to "${normalizedStatus}"`);
        setFormData(prev => ({
          ...prev,
          status: normalizedStatus
        }));
      }
    }
  }, [formData.status, setFormData]);

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
    console.log(`Handling select change for ${id}: ${value}`);
    
    if (id === 'linkedCourseId' || id === 'linkedQuizId') {
      const finalValue = value === 'none' ? '' : value;
      console.log(`Setting ${id} to:`, finalValue === '' ? 'empty string (will be null)' : finalValue);
      setFormData((prev) => ({ ...prev, [id]: finalValue }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  // Modified handleSwitchChange to preserve linked course/quiz when toggling certification
  const handleSwitchChange = (id: string, checked: boolean) => {
    console.log(`Setting ${id} to:`, checked, typeof checked);
    
    if (id === 'requiresCertification') {
      // Keep the existing linkedCourseId and linkedQuizId values regardless of the certification toggle
      setFormData(prev => ({
        ...prev,
        requiresCertification: Boolean(checked)
        // We don't modify linkedCourseId or linkedQuizId here
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: Boolean(checked)
      }));
    }
  };

  const handleImageChange = (dataUrl: string | null) => {
    console.log("Image changed:", dataUrl ? `[data URL of ${dataUrl?.length} bytes]` : 'null');
    if (dataUrl) {
      setImagePreview(dataUrl);
      setFormData(prev => ({
        ...prev,
        imageUrl: dataUrl
      }));
    }
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
    const finalFormData = {
      ...formData,
      requiresCertification: Boolean(formData.requiresCertification)
    };
    
    console.log("Submitting form data:", {
      ...finalFormData,
      requiresCertification: `${finalFormData.requiresCertification} (${typeof finalFormData.requiresCertification})`,
    });
    
    setFormData(finalFormData);
    
    onSubmit();
  };

  const suggestedCourse = getRecommendedCourse();
  const suggestedQuiz = getRecommendedQuiz();

  const getCourseDisplayValue = () => {
    if (!formData.linkedCourseId) return "none";
    return formData.linkedCourseId;
  };

  const getQuizDisplayValue = () => {
    if (!formData.linkedQuizId) return "none";
    return formData.linkedQuizId;
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => (c._id || c.id) === courseId);
    return course ? course.title : `Course ${courseId}`;
  };

  const getQuizName = (quizId: string) => {
    const quiz = quizzes.find(q => (q._id || q.id) === quizId);
    return quiz ? quiz.title : `Quiz ${quizId}`;
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    
    if (url.startsWith('data:')) {
      return url;
    }
    
    if (url.startsWith('http')) {
      return url;
    }
    
    // For server URLs from API
    if (url.startsWith('/utils/images')) {
      return `http://localhost:4000${url}`;
    }
    
    return url;
  };

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
                  <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                  <SelectItem value="Certification">Certification</SelectItem>
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
                rows={3}
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
                  <SelectValue placeholder="Select machine status" />
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
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Machine Image</Label>
              <div className="flex flex-col space-y-2">
                {imagePreview && (
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden mb-2">
                    <img 
                      src={getImageUrl(imagePreview)}
                      alt="Machine preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Failed to load image preview:", imagePreview);
                        // Don't set a fallback to avoid infinite error loop
                      }}
                    />
                  </div>
                )}
                <FileUpload 
                  id="image"
                  onFileSelect={handleImageChange}
                  accept="image/*"
                  maxSizeMB={5}
                  label="Upload Machine Image"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specifications">Specifications</Label>
              <Textarea
                id="specifications"
                value={formData.specifications || ''}
                onChange={handleInputChange}
                placeholder="Enter machine specifications"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Additional Details</Label>
              <Textarea
                id="details"
                value={formData.details || ''}
                onChange={handleInputChange}
                placeholder="Enter additional details"
                rows={4}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="certification" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="requiresCertification"
                checked={formData.requiresCertification}
                onCheckedChange={(checked) => handleSwitchChange('requiresCertification', checked)}
              />
              <Label htmlFor="requiresCertification">Requires Certification</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="certificationInstructions">Certification Instructions</Label>
              <Textarea
                id="certificationInstructions"
                value={formData.certificationInstructions || ''}
                onChange={handleInputChange}
                placeholder="Enter certification instructions"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkedCourseId">Linked Course</Label>
              <Select
                value={getCourseDisplayValue()}
                onValueChange={(value) => handleSelectChange('linkedCourseId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select linked course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {courses.map((course) => (
                    <SelectItem 
                      key={course._id || course.id} 
                      value={course._id || course.id}
                    >
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {suggestedCourse && !formData.linkedCourseId && (
                <p className="text-xs text-purple-600 mt-1">
                  Suggestion: Link to "{suggestedCourse.title}"
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkedQuizId">Linked Quiz</Label>
              <Select
                value={getQuizDisplayValue()}
                onValueChange={(value) => handleSelectChange('linkedQuizId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select linked quiz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {quizzes.map((quiz) => (
                    <SelectItem 
                      key={quiz._id || quiz.id} 
                      value={quiz._id || quiz.id}
                    >
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {suggestedQuiz && !formData.linkedQuizId && (
                <p className="text-xs text-purple-600 mt-1">
                  Suggestion: Link to "{suggestedQuiz.title}"
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MachineForm;
