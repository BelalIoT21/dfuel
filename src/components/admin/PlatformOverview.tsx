
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Laptop, Smartphone } from 'lucide-react';
import { isWeb, isPlatformNative, isIOS, isAndroid } from '@/utils/platform';

export const PlatformOverview = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Platform Information</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Web Platform Card */}
          <div className="border rounded-md p-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-base font-semibold">Web Platform</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Running in a web browser
                  </p>
                </div>
                <p className="text-base font-bold mt-4">
                  {isWeb() ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Native Platform Card */}
          <div className="border rounded-md p-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-base font-semibold">Native Platform</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Running on a native platform (React Native, Capacitor, etc)
                  </p>
                </div>
                <p className="text-base font-bold mt-4">
                  {isPlatformNative() ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Laptop className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* iOS Platform Card */}
          <div className="border rounded-md p-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-base font-semibold">iOS</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Running on iOS device
                  </p>
                </div>
                <p className="text-base font-bold mt-4">
                  {isIOS() ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Android Platform Card */}
          <div className="border rounded-md p-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-base font-semibold">Android</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Running on Android device
                  </p>
                </div>
                <p className="text-base font-bold mt-4">
                  {isAndroid() ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformOverview;
