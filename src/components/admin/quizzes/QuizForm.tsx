
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { machineDatabaseService } from '@/services/database/machineService';
import { courseDatabaseService } from '@/services/database/courseService';
import { X, Plus, Trash2 } from 'lucide-react';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizFormData {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  questions: QuizQuestion[];
  passingScore: number;
  relatedMachineIds?: string[];
  relatedCourseId?: string;
  difficulty: string;
}

interface QuizFormProps {
  formData: QuizFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuizFormData>>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  submitLabel: string;
}

const QuizForm: React.FC<QuizFormProps> = ({
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
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedMachines, fetchedCourses] = await Promise.all([
          machineDatabaseService.getAllMachines(),
          courseDatabaseService.getAllCourses()
        ]);
        
        setMachines(fetchedMachines || []);
        setCourses(fetchedCourses || []);
      } catch (error) {
        console.error("Error fetching data for quiz form:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Make sure we have at least one question
  useEffect(() => {
    if (formData.questions.length === 0) {
      addQuestion();
    }
  }, [formData.questions]);

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

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', ''],
          correctAnswer: 0,
          explanation: '',
        },
      ],
    }));
    // Set the active index to the new question
    setActiveQuestionIndex(formData.questions.length);
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    // Adjust active index if needed
    if (activeQuestionIndex >= formData.questions.length - 1) {
      setActiveQuestionIndex(Math.max(0, formData.questions.length - 2));
    }
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const addOption = (questionIndex: number) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: [...updatedQuestions[questionIndex].options, ''],
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
        // Reset correct answer if it's now out of bounds
        correctAnswer: updatedQuestions[questionIndex].correctAnswer >= updatedOptions.length 
          ? 0 
          : updatedQuestions[questionIndex].correctAnswer,
      };
      return { ...prev, questions: updatedQuestions };
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
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter quiz title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter quiz description"
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
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={formData.passingScore}
                onChange={(e) => setFormData((prev) => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                placeholder="Enter passing score (e.g., 70)"
              />
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
          
          <TabsContent value="questions" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Questions</h3>
              <Button 
                onClick={addQuestion} 
                size="sm" 
                type="button"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Question
              </Button>
            </div>
            
            {formData.questions.length > 0 ? (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4 space-y-2">
                  <div className="font-medium mb-2">Question List</div>
                  <div className="border rounded-md max-h-[500px] overflow-y-auto">
                    {formData.questions.map((q, index) => (
                      <div 
                        key={index} 
                        className={`p-3 flex justify-between items-center border-b cursor-pointer ${
                          index === activeQuestionIndex ? 'bg-primary text-white' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveQuestionIndex(index)}
                      >
                        <div className="truncate">
                          {q.question ? q.question.substring(0, 20) + '...' : `Question ${index + 1}`}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQuestion(index);
                          }}
                          className={index === activeQuestionIndex ? 'text-white hover:text-white' : ''}
                          disabled={formData.questions.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="w-full md:w-3/4">
                  {formData.questions[activeQuestionIndex] && (
                    <div className="border rounded-md p-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Textarea
                          value={formData.questions[activeQuestionIndex].question}
                          onChange={(e) => updateQuestion(activeQuestionIndex, 'question', e.target.value)}
                          placeholder="Enter question"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Options</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addOption(activeQuestionIndex)}
                            type="button"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Option
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {formData.questions[activeQuestionIndex].options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <div className="flex-grow flex items-center gap-2">
                                <input
                                  type="radio"
                                  id={`option-${activeQuestionIndex}-${optIndex}`}
                                  name={`correct-${activeQuestionIndex}`}
                                  checked={formData.questions[activeQuestionIndex].correctAnswer === optIndex}
                                  onChange={() => updateQuestion(activeQuestionIndex, 'correctAnswer', optIndex)}
                                  className="h-4 w-4"
                                />
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(activeQuestionIndex, optIndex, e.target.value)}
                                  placeholder={`Option ${optIndex + 1}`}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(activeQuestionIndex, optIndex)}
                                disabled={formData.questions[activeQuestionIndex].options.length <= 2}
                                type="button"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Explanation (Optional)</Label>
                        <Textarea
                          value={formData.questions[activeQuestionIndex].explanation || ''}
                          onChange={(e) => updateQuestion(activeQuestionIndex, 'explanation', e.target.value)}
                          placeholder="Enter explanation for the correct answer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No questions added yet. Click "Add Question" to get started.</p>
              </div>
            )}
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
                  <Label htmlFor="relatedCourseId">Related Course</Label>
                  <Select
                    value={formData.relatedCourseId || ''}
                    onValueChange={(value) => handleSelectChange('relatedCourseId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course._id || course.id} value={course._id || course.id}>
                          {course.title}
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

export default QuizForm;
