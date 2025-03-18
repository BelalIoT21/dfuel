
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';
import { Check, WifiOff, Settings } from 'lucide-react';
import { isAndroid, isCapacitor, isIOS } from '@/utils/platform';
import { getEnv, setEnv, getLocalServerIP } from '@/utils/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [customServerIP, setCustomServerIP] = useState(getEnv('CUSTOM_SERVER_IP', ''));
  const [showIPDialog, setShowIPDialog] = useState(false);
  const { user, loading: authLoading, login, register } = useAuth();
  const navigate = useNavigate();

  // Check server connection
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log("Checking server health...");
        // Use correct IP based on platform
        const serverIP = getLocalServerIP();
        const serverUrl = `http://${serverIP}:4000/api/health`;
        
        console.log(`Attempting to connect to server at: ${serverUrl}`);
        const timestamp = new Date().getTime(); // Add timestamp to bypass cache
        const response = await fetch(`${serverUrl}?t=${timestamp}`);
        
        if (response.ok) {
          console.log("Server health check successful");
          setServerStatus('connected');
          
          toast({
            title: 'Server Connected',
            description: `Successfully connected to the backend server at ${serverIP}:4000`,
          });
        } else {
          throw new Error(`Server returned ${response.status}`);
        }
      } catch (error) {
        console.error("Server connection error:", error);
        setServerStatus('disconnected');
        
        // Get platform-specific message
        let errorMessage = 'Could not connect to the backend server. Please ensure the server is running.';
        
        if (isAndroid() || isCapacitor()) {
          errorMessage = 'Could not connect to the backend server. Make sure your server is running and the IP address is correct in settings.';
        } else if (isIOS()) {
          errorMessage = 'Could not connect to the backend server. iOS has stricter network security requirements. Make sure your server uses HTTPS or add a security exception.';
        }
        
        toast({
          title: 'Server Connection Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        
        // Try API service as fallback
        try {
          const apiResponse = await apiService.checkHealth();
          if (apiResponse.data && apiResponse.status === 200) {
            setServerStatus('connected via API');
            
            toast({
              title: 'API Server Connected',
              description: 'Connected via alternative API endpoint',
            });
          }
        } catch (apiError) {
          console.error("API service connection also failed:", apiError);
        }
      }
    };
    
    checkServer();
    // Set up an interval to periodically check server status
    const intervalId = setInterval(checkServer, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [customServerIP]); // Re-run when customServerIP changes

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User is logged in, redirecting:", user);
      navigate('/home');
    }
  }, [user, navigate, authLoading]);

  const handleLogin = async (email: string, password: string) => {
    console.log("Attempting login with:", email);
    const success = await login(email, password);
    console.log("Login success:", success);
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    console.log("Attempting registration for:", email);
    await register(email, password, name);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const saveCustomIP = () => {
    if (customServerIP) {
      setEnv('CUSTOM_SERVER_IP', customServerIP);
      toast({
        title: 'Server IP Updated',
        description: `Custom server IP set to: ${customServerIP}`,
      });
      // Force a reload to apply the new settings
      window.location.reload();
    }
    setShowIPDialog(false);
  };

  // Debug rendering
  console.log("Rendering Index component, auth loading:", authLoading);

  const isConnected = serverStatus === 'connected' || serverStatus === 'connected via API';

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="inline-block h-8 w-8 rounded-full border-4 border-t-purple-500 border-opacity-25 animate-spin"></div>
      </div>
    );
  }

  // If user is already logged in, show loading until redirect happens
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="inline-block h-8 w-8 rounded-full border-4 border-t-purple-500 border-opacity-25 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center relative">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          {serverStatus && (
            <div className={isConnected
              ? 'mt-2 text-sm text-green-600 flex items-center justify-center' 
              : 'mt-2 text-sm text-red-600 flex items-center justify-center'}>
              {isConnected ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Server: Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 mr-1" />
                  Server: Disconnected
                </>
              )}
            </div>
          )}
          
          {/* Settings button for custom server IP */}
          <button 
            onClick={() => setShowIPDialog(true)}
            className="absolute right-0 top-0 p-2 text-gray-500 hover:text-purple-600"
            aria-label="Server Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm 
                onLogin={handleLogin} 
                onToggleMode={toggleMode} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm 
                onRegister={handleRegister} 
                onToggleMode={toggleMode} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Custom Server IP Dialog */}
      <Dialog open={showIPDialog} onOpenChange={setShowIPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Server Connection Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Enter your server IP address below. For Android physical devices, use your computer's local network IP (e.g., 192.168.1.x).
              </p>
              <p className="text-xs text-gray-400">
                Current platform: {isAndroid() ? 'Android' : isIOS() ? 'iOS' : 'Web'}
                {isCapacitor() ? ' (Capacitor)' : ''}
              </p>
            </div>
            <Input 
              placeholder="Server IP address (e.g. 192.168.1.10)" 
              value={customServerIP}
              onChange={(e) => setCustomServerIP(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIPDialog(false)}>Cancel</Button>
            <Button onClick={saveCustomIP}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
