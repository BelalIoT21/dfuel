
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { machines } from '../utils/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import userDatabase from '../services/userDatabase';
import { toast } from '@/components/ui/use-toast';

interface ExtendedMachine {
  id: string;
  name: string;
  description: string;
  image: string;
  courseCompleted: boolean;
  quizPassed: boolean;
  status: 'available' | 'maintenance' | 'in-use';
}

const Home = () => {
  console.log("Home component rendering");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [machineData, setMachineData] = useState<ExtendedMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("Auth state in Home:", { user, loading });

  useEffect(() => {
    // If auth is still loading, wait
    if (loading) {
      console.log("Auth is still loading, waiting...");
      return;
    }
    
    // If no user after auth is loaded, redirect to login
    if (!user && !loading) {
      console.log("No user found, redirecting to login page");
      navigate('/');
      return;
    }

    if (user?.isAdmin) {
      console.log("User is admin, redirecting to admin dashboard");
      navigate('/admin');
      return;
    }
    
    // Load machine data
    async function loadMachineData() {
      try {
        console.log("Loading machine data...");
        setIsLoading(true);
        setError(null);
        
        const extendedMachines = await Promise.all(machines.map(async (machine) => {
          try {
            const status = await userDatabase.getMachineStatus(machine.id);
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
        
        console.log("Machine data loaded:", extendedMachines);
        setMachineData(extendedMachines);
      } catch (error) {
        console.error("Error loading machine data:", error);
        setError("Failed to load machine data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load machine data",
          variant: "destructive"
        });
        // Still set default machine data to avoid blank screen
        setMachineData(machines.map(machine => ({
          ...machine,
          status: 'available' as const
        })));
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user) {
      loadMachineData();
    }
  }, [user, loading, navigate]);

  // Show an explicit loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-purple-800">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Guard against no user (should redirect, but just in case)
  if (!user && !loading) {
    console.log("No user found in render phase, returning null");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Select a machine to get started</p>
            {error && <p className="text-red-500 mt-1">{error}</p>}
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-t-purple-500 border-opacity-25 animate-spin"></div>
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
