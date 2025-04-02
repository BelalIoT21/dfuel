
import { Card, CardContent } from '@/components/ui/card';
import { Server, Laptop, Globe, Database } from 'lucide-react';
import { isWeb, isPlatformNative, isIOS, isAndroid, isMobile, isCapacitor } from '@/utils/platform';

export const PlatformOverview = () => {
  const platformInfo = [
    { 
      name: 'Web Platform',
      value: isWeb() ? 'Yes' : 'No',
      icon: <Globe className="h-4 w-4 text-purple-600" />,
      description: 'Running in a web browser'
    },
    { 
      name: 'Native Platform',
      value: isPlatformNative() ? 'Yes' : 'No',
      icon: <Laptop className="h-4 w-4 text-purple-600" />,
      description: 'Running on a native platform (React Native, Capacitor, etc)'
    },
    { 
      name: 'iOS',
      value: isIOS() ? 'Yes' : 'No',
      icon: <Laptop className="h-4 w-4 text-purple-600" />,
      description: 'Running on iOS device'
    },
    { 
      name: 'Android',
      value: isAndroid() ? 'Yes' : 'No',
      icon: <Laptop className="h-4 w-4 text-purple-600" />,
      description: 'Running on Android device'
    },
    { 
      name: 'Mobile Device',
      value: isMobile() ? 'Yes' : 'No',
      icon: <Laptop className="h-4 w-4 text-purple-600" />,
      description: 'Running on a mobile device'
    },
    { 
      name: 'Capacitor',
      value: isCapacitor() ? 'Yes' : 'No',
      icon: <Laptop className="h-4 w-4 text-purple-600" />,
      description: 'Running in a Capacitor container'
    },
    { 
      name: 'MongoDB Direct Access',
      value: !isWeb() ? 'Available' : 'Not Available',
      icon: <Database className="h-4 w-4 text-purple-600" />,
      description: 'Direct MongoDB connection status'
    },
    { 
      name: 'API Access',
      value: 'Available',
      icon: <Server className="h-4 w-4 text-purple-600" />,
      description: 'API access status'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Platform Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platformInfo.map((info, index) => (
            <div key={`platform-info-${index}`} className="border rounded-md p-3 flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                {info.icon}
              </div>
              <div>
                <p className="font-medium">{info.name}</p>
                <p className="text-sm text-gray-500">{info.description}</p>
                <p className="text-sm font-bold mt-1">{info.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformOverview;
