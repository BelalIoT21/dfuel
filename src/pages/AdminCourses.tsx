
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import { courseDatabaseService } from '@/services/database/courseService';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const AdminCourses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/home');
      return;
    }

    const fetchCourses = async () => {
      try {
        const fetchedCourses = await courseDatabaseService.getAllCourses();
        if (fetchedCourses && fetchedCourses.length > 0) {
          setCoursesList(fetchedCourses);
        } else {
          setCoursesList([]);
        }
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCoursesList([]);
        setInitialLoadComplete(true);
      }
    };
    
    fetchCourses();
  }, [navigate, user?.isAdmin]);

  const handleDeleteCourse = async (id: string) => {
    try {
      setIsSubmitting(true);
      const success = await courseDatabaseService.deleteCourse(id);
      
      if (!success) {
        throw new Error("Failed to delete course");
      }
      
      toast({
        title: "Course Deleted",
        description: "The course has been deleted successfully."
      });
      
      setCoursesList(prev => prev.filter(c => c._id !== id && c.id !== id));
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error Deleting Course",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = coursesList
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto page-transition">
        <div className="mb-6">
          <BackToAdminButton />
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Course Management</h1>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="w-full md:w-1/3">
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild className="w-full md:w-auto">
                <Link to="/admin/courses/new" className="flex items-center justify-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Course
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>Manage and monitor all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!initialLoadComplete ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading courses...</p>
                </div>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div key={course._id || course.id} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-0">
                    <div className="flex-shrink-0 w-full md:w-1/4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={course.imageUrl || '/placeholder.svg'}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium">{course.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {course.category}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          {course.difficulty || 'Beginner'}
                        </Badge>
                        {course.quizId && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            Has Quiz
                          </Badge>
                        )}
                        {course.relatedMachineIds && course.relatedMachineIds.length > 0 && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {course.relatedMachineIds.length} Related Machines
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/course/${course._id || course.id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/courses/edit/${course._id || course.id}`}>Edit</Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteCourse(course._id || course.id)}
                          disabled={isSubmitting}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? (
                    <>
                      <p>No courses found matching your search criteria.</p>
                      <Button 
                        className="mt-4" 
                        variant="outline" 
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>No courses have been created yet.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/admin/courses/new')}
                      >
                        Create Your First Course
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCourses;
