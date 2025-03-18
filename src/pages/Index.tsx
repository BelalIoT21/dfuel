import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';
import { Check, WifiOff } from 'lucide-react';
import { isAndroid, isCapacitor, isIOS } from '@/utils/platform';
import { getEnv, loadEnv, getApiEndpoints } from '@/utils/env';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { user, loading: authLoading, login, register } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const prevServerStatusRef = useRef<string | null>(null);
  const checkingRef = useRef<boolean>(false);
  const attemptedEndpointsRef = useRef<string[]>([]);

  useEffect(() => {
    loadEnv();
    console.log("Environment loaded");
    
    // Log available endpoints for debugging
    const endpoints = getApiEndpoints();
    console.log("Available API endpoints:", endpoints);
  }, []);

  useEffect(() => {
    const handleKeyboardShow = () => {
      console.log("Keyboard shown");
      setKeyboardVisible(true);
    };
    
    const handleKeyboardHide = () => {
      console.log("Keyboard hidden");
      setKeyboardVisible(false);
    };
    
    if (isAndroid() || isIOS()) {
      if (isAndroid()) {
        // Better keyboard detection for Android
        const originalHeight = window.innerHeight;
        window.addEventListener('resize', () => {
          const isKeyboardVisible = window.innerHeight < originalHeight * 0.75;
          setKeyboardVisible(isKeyboardVisible);
          console.log(`Keyboard detection: ${isKeyboardVisible ? 'shown' : 'hidden'}, height: ${window.innerHeight}/${originalHeight}`);
        });
      } else if (isIOS()) {
        if (window.visualViewport) {
          // More precise keyboard detection for iOS
          const viewportHandler = () => {
            const isKeyboardOpen = window.visualViewport!.height < window.innerHeight * 0.75;
            setKeyboardVisible(isKeyboardOpen);
            console.log(`iOS keyboard: ${isKeyboardOpen ? 'shown' : 'hidden'}, viewport: ${window.visualViewport!.height}/${window.innerHeight}`);
          };
          
          window.visualViewport.addEventListener('resize', viewportHandler);
          window.visualViewport.addEventListener('scroll', viewportHandler);
          
          return () => {
            window.visualViewport!.removeEventListener('resize', viewportHandler);
            window.visualViewport!.removeEventListener('scroll', viewportHandler);
          };
        }
      }
    }
  }, []);

  useEffect(() => {
    const checkServer = async () => {
      // Prevent multiple concurrent checks
      if (checkingRef.current) {
        console.log("Server check already in progress, skipping");
        return;
      }
      
      checkingRef.current = true;
      
      try {
        console.log("Checking server health...");
        const serverIP = getEnv('CUSTOM_SERVER_IP');
        console.log(`Using server IP: ${serverIP}`);
        
        // Try multiple endpoints
        const endpoints = [
          `http://${serverIP}:4000/api/health`,
          'http://localhost:4000/api/health',
          `/api/health`
        ];
        
        attemptedEndpointsRef.current = [];
        let connected = false;
        
        for (const endpoint of endpoints) {
          if (connected) break;
          
          const timestamp = new Date().getTime();
          const url = `${endpoint}?t=${timestamp}`;
          console.log(`Attempting to connect to: ${url}`);
          
          attemptedEndpointsRef.current.push(url);
          
          // Set a timeout to prevent hanging on the fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout
          
          try {
            const response = await fetch(url, {
              signal: controller.signal,
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
            });
            clearTimeout(timeoutId);
            
            // Log the complete response for debugging
            console.log(`Response from ${url}:`, {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries([...response.headers.entries()])
            });
            
            if (response.ok) {
              console.log("Server health check successful");
              
              // Only update status and show toast if status changed
              if (serverStatus !== 'connected') {
                setServerStatus('connected');
                
                // Only show toast if status changed from a different value
                if (prevServerStatusRef.current !== 'connected') {
                  toast({
                    title: 'Server Connected',
                    description: `Successfully connected to the backend server at ${url}`,
                  });
                }
              }
              
              prevServerStatusRef.current = 'connected';
              connected = true;
              break;
            } else {
              console.log(`Server returned ${response.status} for ${url}`);
              throw new Error(`Server returned ${response.status}`);
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error(`Connection error for ${url}:`, fetchError);
          }
        }
        
        // If we couldn't connect with any direct endpoint, try the apiService
        if (!connected) {
          console.log("Trying API service health check as fallback");
          try {
            const apiResponse = await apiService.checkHealth();
            console.log("API health check response:", apiResponse);
            
            if (apiResponse.data && apiResponse.status === 200) {
              // Only update status and show toast if status changed
              if (serverStatus !== 'connected via API') {
                setServerStatus('connected via API');
                
                // Only show toast if status changed from a different value
                if (prevServerStatusRef.current !== 'connected via API') {
                  toast({
                    title: 'API Server Connected',
                    description: 'Connected via alternative API endpoint',
                  });
                }
              }
              
              prevServerStatusRef.current = 'connected via API';
              connected = true;
            }
          } catch (apiError) {
            console.error("API service connection also failed:", apiError);
          }
        }
        
        // If we still couldn't connect, set status to disconnected
        if (!connected) {
          console.log("All connection attempts failed");
          
          // Only update status and show toast if status changed
          if (serverStatus !== 'disconnected') {
            setServerStatus('disconnected');
            
            // Only show toast if status changed from a different value
            if (prevServerStatusRef.current !== 'disconnected') {
              toast({
                title: 'Server Connection Failed',
                description: `Could not connect to any server endpoint. Tried: ${attemptedEndpointsRef.current.join(', ')}`,
                variant: 'destructive'
              });
            }
          }
          
          prevServerStatusRef.current = 'disconnected';
        }
      } finally {
        checkingRef.current = false;
      }
    };
    
    // Initial check with a short delay to let the app initialize
    setTimeout(() => {
      checkServer();
    }, 1000);
    
    // Check server at a reduced frequency (45 seconds)
    const intervalId = setInterval(checkServer, 45000);
    
    return () => clearInterval(intervalId);
  }, [serverStatus]);

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

  console.log("Rendering Index component, auth loading:", authLoading);

  const isConnected = serverStatus === 'connected' || serverStatus === 'connected via API';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="inline-block h-8 w-8 rounded-full border-4 border-t-purple-500 border-opacity-25 animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="inline-block h-8 w-8 rounded-full border-4 border-t-purple-500 border-opacity-25 animate-spin"></div>
      </div>
    );
  }

  // Enhanced keyboard handling
  const containerStyle = keyboardVisible && isMobile
    ? { 
        minHeight: '100vh', 
        paddingBottom: '0', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'flex-start', 
        transition: 'all 0.3s ease',
        transform: 'translateY(-20vh)'
      } 
    : { 
        minHeight: '100vh', 
        transition: 'all 0.3s ease',
        transform: 'translateY(0)'
      };

  return (
    <div 
      className="flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4" 
      style={containerStyle}
    >
      <div className={`w-full max-w-md space-y-6 animate-fade-up ${keyboardVisible ? 'mt-4' : 'my-auto'}`}>
        <div className="text-center relative">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          {serverStatus && !keyboardVisible && (
            <div className={isConnected
              ? 'mt-2 text-sm text-green-600 flex items-center justify-center' 
              : 'mt-2 text-sm text-red-600 flex items-center justify-center'}>
              {isConnected ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Server: Connected to {getLocalServerIP()}:4000
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 mr-1" />
                  Server: Unable to connect to {getLocalServerIP()}:4000
                </>
              )}
            </div>
          )}
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
    </div>
  );
};

export default Index;
