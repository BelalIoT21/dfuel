
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { machines } from '../utils/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import userDatabase from '../services/userDatabase';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [machineData, setMachineData] = useState<ExtendedMachine[]>([]);

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (user?.isAdmin) {
      navigate('/admin');
      return;
    }
    
    // Get machine statuses from database
    const extendedMachines = machines.map(machine => {
      const status = userDatabase.getMachineStatus(machine.id) as 'available' | 'maintenance' | 'in-use';
      return {
        ...machine,
        status: status || 'available'
      };
    });
    setMachineData(extendedMachines);
  }, [user, navigate]);

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Welcome, {user.name}</h1>
            <p className="text-gray-600 mt-1">Select a machine to get started</p>
          </div>
          <div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile')} 
              className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 w-full"
            >
              My Profile
            </Button>
          </div>
        </div>

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
                      <div className="flex gap-2">
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
                        {user.certifications.includes(machine.id) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Certified
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-purple-200 bg-purple-100 hover:bg-purple-200 text-purple-800 w-full"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
