
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { machines } from '../../utils/data';
import { Key } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CertificationsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  if (!user) return null;

  // Get user certifications
  const userCertifications = machines
    .filter(machine => user?.certifications.includes(machine.id))
    .map(machine => ({
      id: machine.id,
      name: machine.name,
      date: new Date().toLocaleDateString(), // In a real app, this would come from the database
      type: machine.type
    }));

  const handleTakeSafetyCourse = () => {
    const redirectPath = user.isAdmin ? '/admin' : '/dashboard';
    navigate(redirectPath, { replace: true });
  };

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={20} className="text-purple-600" />
          Your Certifications
        </CardTitle>
        <CardDescription>Machines you are certified to use</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {userCertifications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userCertifications.map((cert) => (
              <div key={cert.id} className="border border-purple-100 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                <div className="font-medium text-purple-800">{cert.name}</div>
                <div className="text-sm text-gray-500">Certified on: {cert.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't completed any certifications yet.</p>
            <Button 
              className="mt-2 bg-purple-600 hover:bg-purple-700" 
              onClick={handleTakeSafetyCourse}
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
