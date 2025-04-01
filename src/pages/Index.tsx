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
import { getEnv, loadEnv, getApiEndpoints, getLocalServerIP } from '@/utils/env';
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
  const originalHeightRef = useRef<number>(0);

  useEffect(() => {
    loadEnv();
    console.log("Environment loaded");
    
    const endpoints = getApiEndpoints();
    console.log("Available API endpoints:", endpoints);
    
    originalHeightRef.current = window.innerHeight;
    console.log("Original window height:", originalHeightRef.current);
  }, []);

  useEffect(() => {
    const handleKeyboardVisibility = () => {
      if (isAndroid() || isIOS()) {
        const currentHeight = window.innerHeight;
        const threshold = originalHeightRef.current * 0.75;
        const isKeyboardOpen = currentHeight < threshold;
        
        console.log(`Keyboard detection: height ${currentHeight}/${originalHeightRef.current}, threshold: ${threshold}`);
        
        if (isKeyboardOpen !== keyboardVisible) {
          console.log(`Keyboard ${isKeyboardOpen ? 'shown' : 'hidden'}`);
          setKeyboardVisible(isKeyboardOpen);
        }
      }
    };
    
    if (isAndroid() || isIOS()) {
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleKeyboardVisibility);
        return () => {
          window.visualViewport?.removeEventListener('resize', handleKeyboardVisibility);
        };
      } else {
        window.addEventListener('resize', handleKeyboardVisibility);
        return () => {
          window.removeEventListener('resize', handleKeyboardVisibility);
        };
      }
    }
  }, [keyboardVisible]);

  useEffect(() => {
    const checkServer = async () => {
      if (checkingRef.current) {
        console.log("Server check already in progress, skipping");
        return;
      }
      
      checkingRef.current = true;
      
      try {
        console.log("Checking server health...");
        const serverIP = getEnv('CUSTOM_SERVER_IP');
        console.log(`Using server IP: ${serverIP}`);
        
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
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
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
            
            console.log(`Response from ${url}:`, {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries([...response.headers.entries()])
            });
            
            if (response.ok) {
              console.log("Server health check successful");
              
              if (serverStatus !== 'connected') {
                setServerStatus('connected');
                
                if (prevServerStatusRef.current !== 'connected') {
                  toast({
                    title: 'Connected',
                    description: 'Successfully connected to the server',
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
        
        if (!connected) {
          console.log("Trying API service health check as fallback");
          try {
            const apiResponse = await apiService.checkHealth();
            console.log("API health check response:", apiResponse);
            
            if (apiResponse.data && apiResponse.status === 200) {
              if (serverStatus !== 'connected') {
                setServerStatus('connected');
                
                if (prevServerStatusRef.current !== 'connected') {
                  toast({
                    title: 'Connected',
                    description: 'Successfully connected to the server',
                  });
                }
              }
              
              prevServerStatusRef.current = 'connected';
              connected = true;
            }
          } catch (apiError) {
            console.error("API service connection also failed:", apiError);
          }
        }
        
        if (!connected) {
          console.log("All connection attempts failed");
          
          if (serverStatus !== 'disconnected') {
            setServerStatus('disconnected');
            
            if (prevServerStatusRef.current !== 'disconnected') {
              toast({
                title: 'Disconnected',
                description: 'Could not connect to the server',
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
    
    setTimeout(() => {
      checkServer();
    }, 1000);
    
    const intervalId = setInterval(checkServer, 45000);
    
    return () => clearInterval(intervalId);
  }, [serverStatus]);

  useEffect(() => {
    if (user && !authLoading) {
      console.log("User is logged in, redirecting:", user);
      navigate(user.isAdmin ? '/admin' : '/home');
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

  const isConnected = serverStatus === 'connected';

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

  const mobileContainerStyle = isMobile
    ? { 
        paddingTop: keyboardVisible ? '1rem' : '10vh',
        paddingBottom: keyboardVisible ? '15vh' : '0',
        minHeight: '100vh',
        transition: 'all 0.3s ease',
      } 
    : { 
        minHeight: '100vh',
        transition: 'all 0.3s ease',
      };

  return (
    <div 
      className="flex flex-col items-center justify-start bg-gradient-to-b from-purple-50 to-white p-4" 
      style={mobileContainerStyle}
    >
      <div className={`w-full max-w-md ${isMobile ? 'max-w-xs' : 'max-w-md'} ${keyboardVisible && isMobile ? 'scale-95' : ''}`}>
        <div className={`text-center ${isMobile ? 'mb-3' : 'mb-6'}`}>
          <h1 className={`font-bold text-purple-800 tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'}`}>Dfuel</h1>
          <p className={`text-gray-600 ${isMobile ? 'text-sm mt-1' : 'mt-2 text-md md:text-lg'}`}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          {serverStatus && !keyboardVisible && (
            <div className={isConnected
              ? 'mt-1 text-green-600 flex items-center justify-center' 
              : 'mt-1 text-red-600 flex items-center justify-center'}>
              {isConnected ? (
                <>
                  <Check className={`mr-1 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className={isMobile ? 'text-xs' : 'text-sm'}>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className={`mr-1 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className={isMobile ? 'text-xs' : 'text-sm'}>Disconnected</span>
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
