import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Key, RefreshCw, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { certificationService } from '@/services/certificationService';
import { machineService } from '@/services/machineService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import BookMachineButton from './BookMachineButton';

// Define special machine IDs that are always displayed regardless of availability
const SPECIAL_MACHINE_IDS = ["5", "6"]; // Safety Cabinet and Machine Safety Course

// Define known machines with correct name mappings for fallback
const MACHINE_NAMES = {
  "1": "Laser Cutter",
  "2": "Ultimaker",
  "3": "X1 E Carbon 3D Printer",
  "4": "Bambu Lab X1 E",
  "5": "Safety Cabinet",
  "6": "Machine Safety Course"
};

const CertificationsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const [machineStatuses, setMachineStatuses] = useState({});
  const [availableMachineIds, setAvailableMachineIds] = useState<string[]>([]);

  const fetchMachinesAndCertifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setRefreshing(true);
    try {
      console.log("Fetching machines for CertificationsCard");
      
      // Fetch the current available machines to determine what exists in the database
      try {
        const allCurrentMachines = await machineService.getMachines();
        console.log("All current machines:", allCurrentMachines.length);
        
        // Extract IDs from current machines
        const currentMachineIds = allCurrentMachines.map(machine => 
          (machine.id || machine._id).toString()
        );
        setAvailableMachineIds(currentMachineIds);
        console.log("Available machine IDs:", currentMachineIds);
      } catch (error) {
        console.error("Error fetching available machines:", error);
        // In case of error, use all standard machines as fallback
        setAvailableMachineIds(Object.keys(MACHINE_NAMES));
      }
      
      // Get the certification list from our service
      const allCertifications = certificationService.getAllCertifications();
      
      // Get fresh user certifications from the service
      let userCerts = [];
      try {
        userCerts = await certificationService.getUserCertifications(user.id);
        console.log("Fresh certifications from service:", userCerts);
      } catch (err) {
        console.error("Error fetching fresh certifications:", err);
        // Fallback to user object
        userCerts = (user?.certifications || []).map(cert => 
          typeof cert === 'string' ? cert : cert.toString()
        );
      }
      
      console.log("User certifications in CertificationsCard:", userCerts);
      
      // Fetch machine statuses
      const statuses = {};
      for (const cert of allCertifications) {
        const machineId = cert.id.toString();
        try {
          const status = await machineService.getMachineStatus(machineId);
          statuses[machineId] = status;
        } catch (err) {
          console.error("Error fetching machine status:", err);
          statuses[machineId] = 'unknown';
        }
      }
      setMachineStatuses(statuses);
      
      // Format the machines for display with correct names
      // only include machines that actually exist in the database OR are special machines (5, 6)
      const formattedMachines = allCertifications
        .filter(machine => {
          const machineId = machine.id.toString();
          
          // Check if the machine should be displayed
          return SPECIAL_MACHINE_IDS.includes(machineId) || // Always include safety cabinet and safety course 
                 availableMachineIds.includes(machineId);   // Include if it's available in the API
        })
        .map(machine => {
          const machineId = machine.id.toString();
          const certDate = user?.certificationDates?.[machineId] 
            ? new Date(user.certificationDates[machineId])
            : new Date();
          
          // Use our predefined machine names as fallback
          const machineName = MACHINE_NAMES[machineId] || machine.name;
          
          return {
            id: machineId,
            name: machineName,
            certified: userCerts.includes(machineId),
            date: format(certDate, 'dd/MM/yyyy'),
            bookable: !SPECIAL_MACHINE_IDS.includes(machineId), // Safety Cabinet and Safety Course aren't bookable
            status: statuses[machineId] || 'unknown'
          };
        });
      
      console.log(`Displaying machines: ${formattedMachines.map(m => m.name).join(', ')}`);
      setMachines(formattedMachines);
    } catch (error) {
      console.error("Error fetching machines:", error);
      toast({
        title: "Error",
        description: "Failed to load machine data"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMachinesAndCertifications();
  }, [user]);

  const handleAction = (machineId: string, isCertified: boolean, isBookable: boolean) => {
    if (isCertified && isBookable) {
      navigate(`/booking/${machineId}`);
    } else {
      navigate(`/machine/${machineId}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'maintenance':
        return 'text-red-600';
      case 'in-use':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'in-use':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    fetchMachinesAndCertifications();
  };

  if (!user) return null;

  return (
    <Card className="border-purple-100">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} className="text-purple-600" />
            Machine Certifications
          </CardTitle>
          <CardDescription>Manage your machine certifications</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="ml-auto"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <div>Loading machines...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {machines.map((machine) => (
              <div key={machine.id} className="border border-purple-100 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                <div className="font-medium text-purple-800 flex justify-between items-center">
                  <span>{machine.name}</span>
                  {machine.status && (
                    <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusClass(machine.status)}`}>
                      {machine.status.replace('-', ' ')}
                    </span>
                  )}
                </div>
                {machine.certified ? (
                  <>
                    <div className="text-sm text-green-600 font-medium mb-1 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Certified
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Certified on: {machine.date}
                    </div>
                    {machine.bookable ? (
                      <div className="flex flex-col gap-2 mt-3">
                        <BookMachineButton 
                          machineId={machine.id}
                          isCertified={machine.certified}
                          machineStatus={machine.status}
                          size="sm"
                          className="w-full"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-1 border-purple-200 hover:bg-purple-100"
                          onClick={() => navigate(`/machine/${machine.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-purple-600 mt-2">
                        Certification Complete
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-sm text-red-500 mb-1">Not certified</div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-red-200 hover:bg-red-100 text-red-600"
                      onClick={() => handleAction(machine.id, false, machine.bookable)}
                    >
                      Get Certified
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificationsCard;
