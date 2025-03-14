
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface MachineImageProps {
  image: string;
  name: string;
  status: string;
  maintenanceDate: string;
  progress: number;
}

export const MachineImage = ({ 
  image, 
  name, 
  status, 
  maintenanceDate, 
  progress 
}: MachineImageProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Fallback image if the provided one fails to load
  const fallbackImage = 'https://images.unsplash.com/photo-1487887235947-a955ef187fcc';
  
  return (
    <Card className="overflow-hidden h-full">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <img 
          src={imageError ? fallbackImage : image} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <Badge variant={status === 'available' ? 'default' : 'destructive'} className="bg-purple-600">
            {status === 'available' ? 'Available' : 'Maintenance'}
          </Badge>
          <span className="text-sm text-gray-500">
            Last maintained: {maintenanceDate}
          </span>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-1">Certification Progress</div>
          <Progress value={progress} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
          <div className="flex justify-between text-sm mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
