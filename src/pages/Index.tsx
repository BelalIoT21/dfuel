
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';
import { Check, WifiOff } from 'lucide-react';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [dbUserCount, setDbUserCount] = useState<number | null>(null);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Check server connection
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log("Checking server health...");
        const response = await fetch('http://localhost:4000/api/health');
        
        if (response.ok) {
          const data = await response.json();
          console.log("Server health check:", data);
          setServerStatus('connected');
          
          // Set MongoDB user count if available
          if (data.mongodb && typeof data.mongodb.userCount === 'number') {
            setDbUserCount(data.mongodb.userCount);
          }
          
          toast({
            title: 'Server Connected',
            description: 'Successfully connected to the backend server',
          });
        } else {
          throw new Error(`Server returned ${response.status}`);
        }
      } catch (error) {
        console.error("Server connection error:", error);
        setServerStatus('disconnected');
        toast({
          title: 'Server Connection Failed',
          description: 'Could not connect to the backend server at localhost:4000. Please ensure the server is running.',
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
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("User is logged in, redirecting:", user);
      navigate('/home');
    }
  }, [user, navigate]);

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

  // Debug rendering
  console.log("Rendering Index component");

  const isConnected = serverStatus === 'connected' || serverStatus === 'connected via API';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center">
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
          {dbUserCount !== null && (
            <div className="mt-1 text-sm text-blue-600">
              MongoDB users: {dbUserCount}
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
