
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { machines } from '../utils/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import userDatabase from '../services/userDatabase';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';

interface ExtendedMachine {
  id: string;
  name: string;
  description: string;
  image: string;
  courseCompleted: boolean;
  quizPassed: boolean;
  status: 'available' | 'maintenance' | 'in-use' | 'locked';
}

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [machineData, setMachineData] = useState<ExtendedMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [safetyCourseCompleted, setSafetyCourseCompleted] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin');
      return;
    }
    
    async function loadMachineData() {
      try {
        setLoading(true);
        
        // Check if user has completed the safety course (look for safety cabinet certification)
        const hasSafetyCert = user?.certifications?.includes('safety-cabinet');
        setSafetyCourseCompleted(!!hasSafetyCert);
        
        const extendedMachines = await Promise.all(machines.map(async (machine) => {
          try {
            const status = await userDatabase.getMachineStatus(machine.id);
            
            // If safety course is not completed and it's not the safety cabinet itself, mark as locked
            let machineStatus: 'available' | 'maintenance' | 'in-use' | 'locked' = 
              (status as 'available' | 'maintenance' | 'in-use') || 'available';
            
            if (!hasSafetyCert && machine.id !== 'safety-cabinet') {
              machineStatus = 'locked';
            }
            
            return {
              ...machine,
              status: machineStatus
            };
          } catch (error) {
            console.error(`Error loading status for machine ${machine.id}:`, error);
            return {
              ...machine,
              status: !hasSafetyCert && machine.id !== 'safety-cabinet' ? 'locked' : 'available'
            };
          }
        }));
        setMachineData(extendedMachines);
      } catch (error) {
        console.error("Error loading machine data:", error);
        toast({
          title: "Error",
          description: "Failed to load machine data",
          variant: "destructive"
        });
        setMachineData(machines.map(machine => ({
          ...machine,
          status: !safetyCourseCompleted && machine.id !== 'safety-cabinet' ? 'locked' : 'available'
        })));
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadMachineData();
    }
  }, [user, navigate, safetyCourseCompleted]);

  if (!user) {
    navigate('/');
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

        {!safetyCourseCompleted && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">Safety Course Required</h3>
                  <p className="text-yellow-700 mb-4">
                    All machines are locked until you complete the required safety course.
                  </p>
                  <Button 
                    onClick={() => navigate('/machine/safety-cabinet')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Take Safety Course
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
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
                                : machine.status === 'locked'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {machine.status === 'available' 
                              ? 'Available' 
                              : machine.status === 'maintenance'
                                ? 'Maintenance'
                                : machine.status === 'locked'
                                  ? 'Locked'
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
                        {machine.status === 'locked' ? 'Unlock' : 'Learn More'}
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
