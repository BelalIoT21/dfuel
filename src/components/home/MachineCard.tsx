
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExtendedMachine {
  id: string;
  name: string;
  description: string;
  image?: string;
  imageUrl?: string;
  courseCompleted: boolean;
  quizPassed: boolean;
  status: 'available' | 'maintenance' | 'in-use' | 'locked';
}

interface MachineCardProps {
  machine: ExtendedMachine;
  userCertifications?: string[];
}

const MachineCard = ({ machine, userCertifications = [] }: MachineCardProps) => {
  const isCertified = userCertifications.includes(machine.id);
  
  // Use imageUrl first, then fall back to image property, then to placeholder
  const imageSource = machine.imageUrl || machine.image || '/placeholder.svg';

  return (
    <Link to={`/machine/${machine.id}`} key={machine.id}>
      <Card className="h-full transition-all duration-300 hover:shadow-lg card-hover border-purple-100">
        <CardHeader>
          <CardTitle>{machine.name}</CardTitle>
          <CardDescription>{machine.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={imageSource}
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
                {isCertified && (
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
  );
};

export default MachineCard;
