
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { machineDatabaseService } from '@/services/database/machineService';
import { quizDatabaseService } from '@/services/database/quizService';
import { useEffect, useState } from 'react';
import { CheckboxItem } from '../../ui/checkbox';

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  content: string;
  imageUrl?: string;
  relatedMachineIds?: string[];
  quizId?: string;
  difficulty: string;
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

  useEffect(() => {
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
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
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
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter course title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
              />
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
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl || ''}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Course Content (Markdown)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter course content in Markdown format"
                className="min-h-[300px] font-mono"
              />
              <p className="text-xs text-gray-500">You can use Markdown formatting for rich content.</p>
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
                    value={formData.quizId || ''}
                    onValueChange={(value) => handleSelectChange('quizId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quiz (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseForm;
