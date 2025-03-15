
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { machines } from '../../utils/data';
import { Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { machineService } from '@/services/machineService';

const CertificationsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [machineData, setMachineData] = useState<{[key: string]: {name: string, type: string}}>({});
  
  useEffect(() => {
    const loadMachineData = async () => {
      try {
        // Load machine data for every certification
        const data = {};
        
        // Add special cases with correct naming
        data["6"] = { name: "Machine Safety Course", type: "Safety Course" };
        data["5"] = { name: "Bambu Lab X1 E", type: "3D Printer" };
        data["4"] = { name: "Bambu Lab X1 E", type: "3D Printer" };
        data["3"] = { name: "Safety Cabinet", type: "Safety Cabinet" };
        
        if (user?.certifications) {
          for (const certId of user.certifications) {
            // Skip special cases we've already handled
            if (["3", "4", "5", "6"].includes(certId)) continue;
            
            try {
              const machine = await machineService.getMachineById(certId);
              if (machine) {
                data[certId] = {
                  name: machine.name,
                  type: machine.type || 'Machine'
                };
              } else {
                data[certId] = {
                  name: `Machine ${certId}`,
                  type: 'Machine'
                };
              }
            } catch (error) {
              console.error(`Error loading machine data for ${certId}:`, error);
              data[certId] = {
                name: `Machine ${certId}`,
                type: 'Machine'
              };
            }
          }
        }
        
        setMachineData(data);
      } catch (error) {
        console.error('Error loading machine data:', error);
      }
    };
    
    if (user) {
      loadMachineData();
    }
  }, [user]);
  
  if (!user) return null;

  // Get user certifications, but exclude Machine Safety Course (ID 6)
  const userCertifications = user.certifications
    .map(certId => ({
      id: certId,
      name: machineData[certId]?.name || `Machine ${certId}`,
      date: format(new Date(), 'dd/MM/yyyy'), // In a real app, this would come from the database
      type: machineData[certId]?.type || 'Machine',
      isBookable: !["3", "6"].includes(certId) && 
                 machineData[certId]?.type !== 'Safety Cabinet' && 
                 machineData[certId]?.type !== 'Safety Course'
    }));

  const handleBookNow = (machineId, isBookable) => {
    if (!isBookable) {
      // For non-bookable machines like Safety Cabinet, just show info
      navigate(`/machine/${machineId}`);
    } else {
      // Use the short ID if possible
      // Check if it's a special case where we know the short ID
      let shortId = machineId;
      if (machineId.length > 10) {
        // Check if we can map to a simple ID
        if (machineData[machineId]?.name?.includes("Bambu")) {
          shortId = "5"; // Use ID 5 for Bambu printers
        } else if (machineData[machineId]?.name?.includes("Laser")) {
          shortId = "1"; // Use ID 1 for Laser Cutters
        } else if (machineData[machineId]?.name?.includes("Ultimaker")) {
          shortId = "2"; // Use ID 2 for Ultimakers
        }
      }
      
      // Navigate directly to the booking page with the machine ID
      navigate(`/booking/${shortId}`);
    }
  };

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={20} className="text-purple-600" />
          Your Machine Certifications
        </CardTitle>
        <CardDescription>Machines you are certified to use</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {userCertifications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userCertifications.map((cert) => (
              <div key={cert.id} className="border border-purple-100 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                <div className="font-medium text-purple-800">{cert.name}</div>
                <div className="text-sm text-gray-500 mb-1">Certified on: {cert.date}</div>
                <div className="text-xs text-gray-400 mb-2">{cert.type || 'Machine'}</div>
                {cert.isBookable ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-purple-200 hover:bg-purple-100"
                    onClick={() => handleBookNow(cert.id, cert.isBookable)}
                  >
                    Book Now
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-purple-200 hover:bg-purple-100"
                    onClick={() => navigate(`/machine/${cert.id}`)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't completed any machine certifications yet.</p>
            <Button 
              className="mt-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/dashboard')}
            >
              Take a Safety Course
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificationsCard;
