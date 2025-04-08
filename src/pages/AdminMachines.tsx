import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import userDatabase from '../services/userDatabase';
import { machineDatabaseService } from '@/services/database/machineService';
import { Building2, Plus, Edit } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { apiService } from '@/services/apiService';

const AdminMachines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [machinesList, setMachinesList] = useState<any[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const isMobile = useIsMobile();
  
  const getProperImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/placeholder.svg';
    
    if (imageUrl.startsWith('/utils/images')) {
      const apiUrl = import.meta.env.API_URL;
      return `${apiUrl}/api${imageUrl}`;
    }
    
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    return imageUrl;
  };
  
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/home');
      return;
    }

    const fetchMachines = async () => {
      try {
        setInitialLoadComplete(false);
        const timestamp = new Date().getTime();
        const fetchedMachines = await machineDatabaseService.getAllMachines();
        
        if (fetchedMachines && fetchedMachines.length > 0) {
          const filteredMachines = fetchedMachines.filter(machine => {
            const id = machine.id || machine._id;
            return id !== '5' && id !== '6';
          }).map(machine => {
            const imageUrl = getProperImageUrl(machine.imageUrl || machine.image || '/placeholder.svg');
            return {
              ...machine,
              imageUrl: imageUrl,
              image: imageUrl
            };
          });
          setMachinesList(filteredMachines);
        } else {
          setMachinesList([]);
        }
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching machines:", error);
        setMachinesList([]);
        setInitialLoadComplete(true);
      }
    };

    const fetchUsers = async () => {
      try {
        const users = await userDatabase.getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    
    const fetchCourses = async () => {
      try {
        const coursesResponse = await apiService.getAllCourses();
        if (coursesResponse.success) {
          setCoursesList(coursesResponse.data);
        } else {
          console.warn("Failed to fetch courses:", coursesResponse.error);
        }
      } catch (error) {
        console.warn("Error in fetchCourses:", error);
      }
    };
    
    fetchMachines();
    fetchUsers();
    fetchCourses();
  }, [navigate, user?.isAdmin]);
  
  const getCourseName = (courseId: string) => {
    const course = coursesList.find(c => c.id === courseId || c._id === courseId);
    return course ? course.title : `Course ${courseId}`;
  };
  
  const handleDeleteMachine = async (id: string) => {
    try {
      setIsSubmitting(true);
      const success = await machineDatabaseService.deleteMachine(id);
      
      if (!success) {
        throw new Error("Failed to delete machine");
      }
      
      toast({
        title: "Machine Deleted",
        description: "The machine has been deleted successfully."
      });
      
      setMachinesList(prev => prev.filter(m => m.id !== id && m._id !== id));
    } catch (error) {
      console.error("Error deleting machine:", error);
      toast({
        title: "Error Deleting Machine",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUsersCertifiedCount = (machineId: string) => {
    return allUsers.filter(user => 
      user.certifications && user.certifications.includes(machineId)
    ).length;
  };
  
  const getBookingsThisMonth = (machineId: string) => {
    let count = 0;
    allUsers.forEach(user => {
      if (user.bookings) {
        const machineBookings = user.bookings.filter((booking: any) => 
          booking.machineId === machineId
        );
        count += machineBookings.length;
      }
    });
    
    return count;
  };

  const filteredMachines = machinesList
    .filter(machine =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.type?.toLowerCase().includes(searchTerm.toLowerCase())
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
        
        <h1 className="text-3xl font-bold mb-6">Machine Management</h1>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="w-full md:w-1/3">
                <Input
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild className="w-full md:w-auto">
                <Link to="/admin/machines/new" className="flex items-center justify-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Machine
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>All Machines</CardTitle>
            <CardDescription>Manage and monitor all machines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!initialLoadComplete ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading machines...</p>
                </div>
              ) : filteredMachines.length > 0 ? (
                filteredMachines.map((machine) => {
                  const machineId = machine.id || machine._id;
                  const linkedCourse = coursesList.find(c => c._id === machine.linkedCourseId);
                  
                  return (
                    <div key={machineId} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-0">
                      <div className="flex-shrink-0 w-full md:w-1/4">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={machine.imageUrl || '/placeholder.svg'}
                            alt={machine.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold mb-2">{machine.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{machine.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {machine.type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {machine.type}
                            </span>
                          )}
                          {machine.status && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {machine.status}
                            </span>
                          )}
                          {linkedCourse && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Course: {linkedCourse.title}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/machine/${machineId}`}>View</Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/admin/machines/edit/${machineId}`}>Edit</Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteMachine(machineId)}
                            disabled={isSubmitting}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? (
                    <>
                      <p>No machines found matching your search criteria.</p>
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
                      <p>No machines have been created yet.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/admin/machines/new')}
                      >
                        Create Your First Machine
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

export default AdminMachines;
