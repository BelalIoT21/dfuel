import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';
import { Check, WifiOff } from 'lucide-react';
import { isAndroid, isCapacitor, isIOS } from '@/utils/platform';
import { getEnv, loadEnv } from '@/utils/env';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { user, loading: authLoading, login, register } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadEnv();
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
        window.addEventListener('resize', () => {
          const isKeyboardVisible = window.innerHeight < window.outerHeight * 0.8;
          setKeyboardVisible(isKeyboardVisible);
        });
      } else if (isIOS()) {
        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', () => {
            setKeyboardVisible(window.visualViewport!.height < window.innerHeight * 0.85);
          });
        }
      }
      
      return () => {
        if (isAndroid()) {
          window.removeEventListener('resize', () => {});
        } else if (isIOS() && window.visualViewport) {
          window.visualViewport.removeEventListener('resize', () => {});
        }
      };
    }
  }, []);

  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log("Checking server health...");
        const serverIP = '192.168.47.238';
        const serverUrl = `http://${serverIP}:4000/api/health`;
        
        console.log(`Attempting to connect to server at: ${serverUrl}`);
        const timestamp = new Date().getTime();
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
        
        let errorMessage = `Could not connect to the backend server at 192.168.47.238:4000. Please ensure the server is running.`;
        
        toast({
          title: 'Server Connection Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        
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
    const intervalId = setInterval(checkServer, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

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

  const containerStyle = keyboardVisible && isMobile
    ? { minHeight: '100vh', paddingBottom: '40vh', transition: 'padding 0.3s ease' }
    : { minHeight: '100vh', transition: 'padding 0.3s ease' };

  return (
    <div 
      className="flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4" 
      style={containerStyle}
    >
      <div className={`w-full max-w-md space-y-6 animate-fade-up ${keyboardVisible ? 'mb-auto' : 'my-auto'}`}>
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
                  Server: Connected to 192.168.47.238:4000
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 mr-1" />
                  Server: Unable to connect to 192.168.47.238:4000
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
