
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { machines } from '../../utils/data';
import { Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const CertificationsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  // Get only real machines - exclude Machine Safety Course (ID 6)
  const realMachines = machines.filter(machine => machine.id !== "6");

  // Get user certifications, but exclude Machine Safety Course (ID 6)
  const userCertifications = realMachines
    .filter(machine => user?.certifications.includes(machine.id))
    .map(machine => ({
      id: machine.id,
      name: machine.name,
      date: format(new Date(), 'dd/MM/yyyy'), // In a real app, this would come from the database
      type: machine.type,
      isBookable: machine.type !== 'Safety Cabinet'
    }));

  const handleBookNow = (machineId, isSafetyCabinet) => {
    if (isSafetyCabinet) {
      // For Safety Cabinet, just show info
      navigate(`/machine/${machineId}`);
    } else {
      // Navigate directly to the booking page with the machine ID
      navigate(`/booking/${machineId}`);
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 border-purple-200 hover:bg-purple-100"
                  onClick={() => handleBookNow(cert.id, !cert.isBookable)}
                >
                  {cert.isBookable ? "Book Now" : "View Details"}
                </Button>
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
