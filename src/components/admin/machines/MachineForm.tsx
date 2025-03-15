
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}

interface Course {
  id: string;
  name: string;
}

interface Quiz {
  id: string;
  name: string;
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
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Basic Safety Training' },
    { id: '2', name: 'Advanced Machine Operation' },
    { id: '3', name: 'Laser Cutter Safety' },
    { id: '4', name: '3D Printing Fundamentals' },
    { id: '5', name: 'Woodworking Basics' },
    { id: '6', name: 'Machine Safety Course' }
  ]);

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    { id: '1', name: 'Safety Knowledge Test' },
    { id: '2', name: 'Machine Operation Quiz' },
    { id: '3', name: 'Laser Cutter Certification' },
    { id: '4', name: '3D Printing Assessment' },
    { id: '5', name: 'Woodworking Safety Quiz' }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
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
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="certification">Certification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Machine Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter machine name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Machine Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select machine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Machine">Machine</SelectItem>
                  <SelectItem value="Cutting">Cutting</SelectItem>
                  <SelectItem value="Printing">Printing</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Woodworking">Woodworking</SelectItem>
                  <SelectItem value="Metalworking">Metalworking</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter machine description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
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
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
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
                placeholder="Enter instructions for certification process"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkedCourseId">Linked Safety Course</Label>
              <Select
                value={formData.linkedCourseId || 'none'}
                onValueChange={(value) => handleSelectChange('linkedCourseId', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Select the safety course for this machine</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkedQuizId">Linked Certification Quiz</Label>
              <Select
                value={formData.linkedQuizId || 'none'}
                onValueChange={(value) => handleSelectChange('linkedQuizId', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a quiz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {quizzes.map(quiz => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Select the certification quiz for this machine</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2 pt-4 border-t mt-4">
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MachineForm;
