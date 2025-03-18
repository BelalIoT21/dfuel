
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { machineService } from '../services/machineService';

interface ExtendedMachine {
  id: string;
  name: string;
  description: string;
  image: string;
  type: string;
  status: 'available' | 'maintenance' | 'in-use';
}

// Define consistent machine data with corrected names
const MACHINE_DATA = [
  {
    id: '1',
    name: 'Laser Cutter',
    description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.',
    image: '/machines/laser-cutter.jpg',
    type: 'Laser Cutter'
  },
  {
    id: '2',
    name: 'Ultimaker',
    description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.',
    image: '/machines/3d-printer.jpg',
    type: '3D Printer'
  },
  {
    id: '3',
    name: 'X1 E Carbon 3D Printer',
    description: 'High-speed multi-material 3D printer with exceptional print quality.',
    image: '/machines/bambu-printer.jpg',
    type: '3D Printer'
  },
  {
    id: '4',
    name: 'Bambu Lab X1 E',
    description: 'Next-generation 3D printing technology with advanced features.',
    image: '/machines/cnc-mill.jpg',
    type: '3D Printer'
  }
];

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
        
        // First fetch all available machines from the API
        const availableMachines = await machineService.getMachines();
        console.log("Available machines from API:", availableMachines);
        
        // Get the IDs of machines that still exist in the database
        const existingMachineIds = availableMachines.map(m => m.id.toString());
        console.log("Existing machine IDs:", existingMachineIds);
        
        // Filter our consistent machine data to only include machines that exist in the database
        const filteredMachineData = MACHINE_DATA.filter(machine => 
          existingMachineIds.includes(machine.id.toString())
        );
        
        // Use our consistent machine data but fetch statuses
        const extendedMachines = await Promise.all(filteredMachineData.map(async (machine) => {
          try {
            const status = await machineService.getMachineStatus(machine.id);
            return {
              ...machine,
              status: (status as 'available' | 'maintenance' | 'in-use') || 'available'
            };
          } catch (error) {
            console.error(`Error loading status for machine ${machine.id}:`, error);
            return {
              ...machine,
              status: 'available' as const
            };
          }
        }));
        
        // Only include machines that exist in the database
        setMachineData(extendedMachines);
        console.log("Filtered machine data:", extendedMachines);
      } catch (error) {
        console.error("Error loading machine data:", error);
        toast({
          title: "Error",
          description: "Failed to load machine data",
          variant: "destructive"
        });
        
        // Try to fetch just the IDs of available machines as a fallback
        try {
          const availableMachines = await machineService.getMachines();
          const existingMachineIds = availableMachines.map(m => m.id.toString());
          
          // Filter static data based on what exists in the database
          const fallbackMachines = MACHINE_DATA.filter(machine => 
            existingMachineIds.includes(machine.id)
          ).map(machine => ({
            ...machine,
            status: 'available' as const
          }));
          
          setMachineData(fallbackMachines);
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          setMachineData([]); // If all else fails, show no machines
        }
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
            {machineData.map((machine) => (
              <Link to={`/machine/${machine.id}`} key={machine.id}>
                <Card className="h-full transition-all duration-300 hover:shadow-lg card-hover border-purple-100">
                  <CardHeader>
                    <CardTitle>{machine.name}</CardTitle>
                    <CardDescription>{machine.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src={machine.image}
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
                          {user.certifications && user.certifications.includes(machine.id) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Certified
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 w-full mt-auto"
                      >
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
