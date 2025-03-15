
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { machines } from '../utils/data';
import { BackToAdminButton } from '@/components/BackToAdminButton';
import userDatabase from '../services/userDatabase';
import { Button } from '@/components/ui/button';

const AdminMachines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [machinesList, setMachinesList] = useState<any[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        console.log('Using demo machines data');
        setMachinesList(machines.slice(0, 4));
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching machines:", error);
        // Ensure we have fallback data if API fails
        setMachinesList(machines.slice(0, 4));
        setInitialLoadComplete(true);
      }
    };

    const fetchUsers = async () => {
      try {
        const users = await userDatabase.getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        setAllUsers([]);
      }
    };
    
    fetchMachines();
    fetchUsers();
  }, []);

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
      machine.type !== 'Equipment' && 
      machine.type !== 'Safety Cabinet'
    )
    .filter(machine =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

  const getMachineType = (type: string | undefined) => {
    if (!type || type === '') return 'Machine';
    return type;
  };

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
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>All Machines</CardTitle>
            <CardDescription>View and monitor your machines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!initialLoadComplete ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading machines...</p>
                </div>
              ) : filteredMachines.length > 0 ? (
                filteredMachines.map((machine) => (
                  <div key={machine.id || machine._id} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-0">
                    <div className="flex-shrink-0 w-full md:w-1/4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={machine.imageUrl || machine.image || '/placeholder.svg'}
                          alt={machine.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium">{machine.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{machine.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          Type: {getMachineType(machine.type)}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                          Difficulty: {machine.difficulty || 'Beginner'}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          Users Certified: {getUsersCertifiedCount(machine.id || machine._id)}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                          Bookings: {getBookingsThisMonth(machine.id || machine._id)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/machine/${machine.id || machine._id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
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
