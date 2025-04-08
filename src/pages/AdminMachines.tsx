import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import userDatabase from '../services/userDatabase';
import { machineDatabaseService } from '@/services/database/machineService';
import { Building2, Plus, Edit } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { apiService } from '@/services/apiService';

const AdminMachines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
  }, []);
  
  const getCourseName = (courseId: string) => {
    const course = coursesList.find(c => c.id === courseId || c._id === courseId);
    return course ? course.title : `Course ${courseId}`;
  };
  
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="mb-4">You don't have permission to access this page.</p>
          <Link to="/home">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredMachines = machinesList
    .filter(machine =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleDeleteMachine = async (id: string) => {
    try {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <BackToAdminButton />
      </div>
      
      <div className="space-y-6">
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
                  const imageUrl = getProperImageUrl(machine.imageUrl || machine.image || '/placeholder.svg');
                  
                  return (
                    <div key={machineId} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-0">
                      <div className="flex-shrink-0 w-full md:w-1/4">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={machine.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`Failed to load image: ${imageUrl}`);
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium">{machine.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{machine.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                            Type: {machine.type || 'Machine'}
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                            Difficulty: {machine.difficulty || 'Beginner'}
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                            Course: {machine.linkedCourseId ? getCourseName(machine.linkedCourseId) : 'None'}
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                            Users Certified: {getUsersCertifiedCount(machineId)}
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                            Bookings: {getBookingsThisMonth(machineId)}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/machine/${machineId}`}>View</Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            asChild
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <Link to={`/admin/machines/edit/${machineId}`} className="flex items-center">
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteMachine(machineId)}
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
                  No machines found matching your search criteria.
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
