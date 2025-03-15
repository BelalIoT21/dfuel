
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { AlertCircle, Database, HardDrive, Server } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { connectionManager } from '@/services/api/connectionManager';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Check server connection
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log("Checking server health...");
        setIsLoading(true);
        
        // Force a connection check first
        await connectionManager.checkConnection();
        
        // Then get detailed server health
        const response = await apiService.checkHealth();
        console.log("Health check response:", response);
        
        if (response.data) {
          console.log("Server health check:", response.data);
          setServerStatus(response.data);
          toast({
            title: 'Server Connected',
            description: 'Successfully connected to the backend server',
          });
        } else if (response.error) {
          console.error("Health check error:", response.error);
          toast({
            title: 'Server Connection Issue',
            description: `Error getting server details: ${response.error}`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error("Server connection error:", error);
        toast({
          title: 'Server Connection Failed',
          description: 'Could not connect to the backend server. Please check the connection settings.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkServer();
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
    await login(email, password);
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    console.log("Attempting registration for:", email);
    await register(email, password, name);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  // Debug rendering
  console.log("Rendering Index component, serverStatus:", serverStatus);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
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
        
        <div className="mt-8">
          <ConnectionStatus />
          
          {serverStatus ? (
            <div className="mt-4 p-4 border rounded-md">
              <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <Server className="h-4 w-4" />
                Server Information
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-gray-500">Environment:</span>
                </div>
                <div className="font-medium">{serverStatus.environment || 'Unknown'}</div>
                
                <div className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-gray-500">Database:</span>
                </div>
                <div className="font-medium flex items-center">
                  {serverStatus.database && serverStatus.database.connected ? (
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Disconnected
                    </span>
                  )}
                </div>
                
                {serverStatus.database && serverStatus.database.connected && (
                  <>
                    <div className="text-gray-500">Host:</div>
                    <div className="font-medium">{serverStatus.database.host}</div>
                    
                    <div className="text-gray-500">Database:</div>
                    <div className="font-medium">{serverStatus.database.database}</div>
                  </>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="mt-4 p-4 border rounded-md">
              <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <Server className="h-4 w-4" />
                Server Information
              </h3>
              <p className="text-sm text-gray-500 py-2">Checking server status...</p>
            </div>
          ) : (
            <div className="mt-4 p-4 border rounded-md border-red-200 bg-red-50">
              <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                Server Information Unavailable
              </h3>
              <p className="text-sm text-red-600">
                Could not retrieve server information. Please check your connection settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
