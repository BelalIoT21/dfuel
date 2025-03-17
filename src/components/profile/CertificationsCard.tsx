
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const MACHINES = [
  { id: "1", name: "Laser Cutter", bookable: true },
  { id: "2", name: "Ultimaker", bookable: true },
  { id: "3", name: "X1 E Carbon 3D Printer", bookable: true },
  { id: "4", name: "Bambu Lab X1 E", bookable: true },
  { id: "5", name: "Safety Cabinet", bookable: false },
  { id: "6", name: "Safety Course", bookable: false }
];

const CertificationsCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Get user certifications as strings to ensure proper comparison
  const userCerts = (user?.certifications || []).map(cert => cert.toString());

  const machines = MACHINES.map(machine => ({
    ...machine,
    certified: userCerts.includes(machine.id),
    date: user?.certificationDates?.[machine.id] || format(new Date(), 'dd/MM/yyyy')
  }));

  useEffect(() => {
    if (user) {
      console.log("User certifications in CertificationsCard:", userCerts);
      setLoading(false);
    }
  }, [user, userCerts]);

  const handleAction = (machineId: string, isCertified: boolean, isBookable: boolean) => {
    if (isCertified && isBookable) {
      navigate(`/booking/${machineId}`);
    } else {
      navigate(`/safety-course/${machineId}`);
    }
  };

  if (!user) return null;

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={20} className="text-purple-600" />
          Machine Certifications
        </CardTitle>
        <CardDescription>Manage your machine certifications</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading machines...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {machines.map((machine) => (
              <div key={machine.id} className="border border-purple-100 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                <div className="font-medium text-purple-800">{machine.name}</div>
                {machine.certified ? (
                  <>
                    <div className="text-sm text-gray-500 mb-1">Certified on: {machine.date}</div>
                    {machine.bookable ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 border-purple-200 hover:bg-purple-100"
                        onClick={() => handleAction(machine.id, true, machine.bookable)}
                      >
                        Book Now
                      </Button>
                    ) : (
                      <div className="text-sm text-green-600 mt-2">
                        Certification Complete
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-sm text-gray-500 mb-1">Not certified</div>
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
