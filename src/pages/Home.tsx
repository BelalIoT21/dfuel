
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { machineService } from '../services/machineService';
import { apiService } from '../services/apiService';
import BookMachineButton from '@/components/profile/BookMachineButton';

interface ExtendedMachine {
  id: string;
  name: string;
  description: string;
  image?: string;
  imageUrl?: string;
  type: string;
  status: 'available' | 'maintenance' | 'in-use';
  requiresCertification?: boolean;
}

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [machineData, setMachineData] = useState<ExtendedMachine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only redirect if auth is fully loaded and user is not present
    if (!authLoading && user === null) {
      navigate('/');
      return;
    }
    
    if (user?.isAdmin) {
      navigate('/admin');
      return;
    }
    
    async function loadMachineData() {
      try {
        setLoading(true);
        console.log("Loading machine data for Home page");
        
        // Fetch all machines from the API with timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await apiService.request(`machines?t=${timestamp}`, 'GET');
        console.log("API response for machines:", response);
        
        if (response.data && Array.isArray(response.data)) {
          // Filter out special machines (5 and 6)
          const filteredMachines = response.data.filter(machine => {
            const id = machine.id || machine._id;
            return id !== '5' && id !== '6';
          });
          
          console.log("Filtered machines:", filteredMachines);
          
          // Map machines to ExtendedMachine format
          const extendedMachines: ExtendedMachine[] = filteredMachines.map(machine => {
            const machineId = String(machine.id || machine._id);
            return {
              id: machineId,
              name: machine.name,
              description: machine.description,
              image: machine.imageUrl || machine.image || '/placeholder.svg',
              imageUrl: machine.imageUrl || machine.image || '/placeholder.svg',
              type: machine.type || 'Machine',
              status: (machine.status?.toLowerCase() || 'available') as 'available' | 'maintenance' | 'in-use',
              requiresCertification: machine.requiresCertification !== false // Default to true if not specified
            };
          });
          
          console.log("Extended machines:", extendedMachines);
          setMachineData(extendedMachines);
        } else {
          console.log("No valid machine data from API");
          setMachineData([]);
        }
      } catch (error) {
        console.error("Error loading machine data:", error);
        toast({
          title: "Error",
          description: "Failed to load machine data",
          variant: "destructive"
        });
        setMachineData([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadMachineData();
    }
  }, [user, navigate, authLoading]);

  // Don't render anything while auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 flex justify-center items-center">
        <div className="inline-block h-8 w-8 rounded-full border-4 border-t-purple-500 border-opacity-25 animate-spin"></div>
      </div>
    );
  }

  // Don't redirect immediately, let the useEffect handle it
  if (!user && !authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Select a machine to get started</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile')} 
              className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800"
            >
              My Profile
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-t-purple-500 border-opacity-25 animate-spin"></div>
          </div>
        ) : machineData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">No Machines Available</h2>
            <p className="text-gray-600">There are currently no machines available in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machineData.map((machine) => {
              // Check if user is certified for this machine
              let isCertified = false;
              
              // Check in user object certifications array (properly compare string values)
              if (user.certifications && Array.isArray(user.certifications)) {
                isCertified = user.certifications.some(cert => {
                  const certString = String(cert);
                  const machineString = String(machine.id);
                  return certString === machineString;
                });
                console.log(`User certification check for machine ${machine.id}:`, isCertified);
              }
              
              return (
                <Card key={machine.id} className="h-full transition-all duration-300 hover:shadow-lg card-hover border-purple-100">
                  <CardHeader>
                    <CardTitle>{machine.name}</CardTitle>
                    <CardDescription>{machine.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src={machine.image || machine.imageUrl || '/placeholder.svg'}
                        alt={machine.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            machine.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : machine.status === 'maintenance'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {machine.status === 'available' 
                              ? 'Available' 
                              : machine.status === 'maintenance'
                                ? 'Maintenance'
                                : 'In Use'}
                          </span>
                          {machine.type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {machine.type}
                            </span>
                          )}
                          {isCertified && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Certified
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Always show BookMachineButton */}
                      <BookMachineButton 
                        machineId={machine.id} 
                        isCertified={isCertified}
                        machineStatus={machine.status}
                        requiresCertification={machine.requiresCertification}
                        className="w-full mt-auto"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
