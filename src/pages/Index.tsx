
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
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const prevServerStatusRef = useRef<string | null>(null);
  const checkingRef = useRef<boolean>(false);
  const attemptedEndpointsRef = useRef<string[]>([]);
  const originalHeightRef = useRef<number>(0);

  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Auth context error:", error);
  }

  const { user, loading: authLoadingState, login, register } = auth || { 
    user: null, 
    loading: false,
    login: async () => { 
      setAuthError("Authentication service is not available"); 
      return false; 
    },
    register: async () => { 
      setAuthError("Authentication service is not available"); 
      return false; 
    }
  };

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
        const threshold = originalHeightRef.current * 0.85; // Higher threshold
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
    if (user && !authLoadingState) {
      console.log("User is logged in, redirecting:", user);
      navigate(user.isAdmin ? '/admin' : '/home');
    }
  }, [user, navigate, authLoadingState]);

  const handleLogin = async (email: string, password: string) => {
    console.log("Attempting login with:", email);
    try {
      if (!login) {
        throw new Error("Authentication service is not available");
      }
      const success = await login(email, password);
      console.log("Login result:", success);
      if (!success) {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      setAuthLoading(true);
      console.debug(`Attempting registration for: ${email}`);
      await register(email, password, name);
      return true;
    } catch (error: any) {
      if (error.name === 'UserExistsError' || error.message?.includes('already exists')) {
        throw error;
      }
      console.error('Unexpected registration error:', error);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  console.log("Rendering Index component, auth loading:", authLoadingState);

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="text-red-500 text-xl mb-4">Authentication Error</div>
        <div className="text-gray-700 mb-6">{authError}</div>
        <button 
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          onClick={() => window.location.reload()}
        >
          Reload Application
        </button>
      </div>
    );
  }

  const isConnected = serverStatus === 'connected';

  if (authLoadingState) {
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

  const containerStyle = isMobile
    ? { 
        minHeight: '100vh', 
        paddingBottom: '0', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: keyboardVisible ? 'flex-start' : 'flex-start', 
        transition: 'all 0.3s ease',
        paddingTop: keyboardVisible ? '0' : '10vh', // Reduced from 5vh to 2vh by default
      } 
    : { 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
      };

  return (
    <div 
      className="bg-gradient-to-b from-purple-50 to-white p-4 min-h-screen flex items-center justify-center" 
      style={containerStyle}
    >
      <div className={`w-full max-w-sm ${isMobile ? 'space-y-0' : 'mx-auto'}`}>
        {!isMobile && (
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold text-purple-800 tracking-tight">dfUEL MakerSpace</h1>
            <p className="mt-1 text-lg text-gray-600">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
            {serverStatus && (
              <div className={isConnected
                ? 'mt-1 text-xs text-green-600 flex items-center justify-center' 
                : 'mt-1 text-xs text-red-600 flex items-center justify-center'}>
                {isConnected ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnected
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {isMobile && (
          <div className={`text-center relative ${keyboardVisible ? 'mb-0 h-3' : 'mb-1'}`}> {/* Reduced mb-2 to mb-1 */}
            {!keyboardVisible && (
              <h1 className={`text-xl md:text-4xl font-bold text-purple-800 tracking-tight`}>dfUEL MakerSpace</h1>
            )}
            {keyboardVisible && (
              <h1 className="text-[10px] font-medium text-purple-800">dfUEL MakerSpace</h1>
            )}
            {!keyboardVisible && (
              <p className="mt-0.5 text-sm md:text-lg text-gray-600"> {/* Reduced mt-1 to mt-0.5 */}
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </p>
            )}
            {serverStatus && !keyboardVisible && (
              <div className={isConnected
                ? 'mt-1 text-xs text-green-600 flex items-center justify-center' 
                : 'mt-1 text-xs text-red-600 flex items-center justify-center'}>
                {isConnected ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnected
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div className="relative mt-0">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
                style={{ top: '0' }}
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
                className="absolute w-full"
                style={{ top: '0' }}
              >
                <RegisterForm 
                  onRegister={handleRegister} 
                  onToggleMode={toggleMode} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="invisible">
          <RegisterForm 
            onRegister={handleRegister} 
            onToggleMode={toggleMode} 
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
