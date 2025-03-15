
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { apiConnection } from '@/services/api/apiConnection';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, Server, Database, RefreshCw } from 'lucide-react';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Check server connection
  const checkServer = async () => {
    try {
      console.log("Checking server health...");
      setIsRetrying(true);
      setServerStatus('checking');
      
      // Check API connection first
      const connected = await apiConnection.checkConnection();
      
      if (!connected) {
        console.error("API connection failed");
        setServerStatus('disconnected');
        setConnectionDetails(null);
        setIsRetrying(false);
        
        toast({
          title: 'Server Connection Failed',
          description: `Could not connect to the backend server at ${apiConnection.getBaseUrl()}. Please ensure the server is running.`,
          variant: 'destructive'
        });
        return;
      }
      
      // Get detailed health information
      const response = await apiService.checkHealth();
      setIsRetrying(false);
      
      if (response.data) {
        console.log("Server health check:", response.data);
        setServerStatus('connected');
        setConnectionDetails(response.data);
        
        toast({
          title: 'Server Connected',
          description: 'Successfully connected to the backend server',
        });
      } else if (response.error) {
        console.error("Server connection error:", response.error);
        setServerStatus('disconnected');
        setConnectionDetails(null);
        
        toast({
          title: 'Server Connection Failed',
          description: `Could not connect to the backend server. ${response.error}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error("Server connection error:", error);
      setServerStatus('disconnected');
      setConnectionDetails(null);
      setIsRetrying(false);
      
      toast({
        title: 'Server Connection Failed',
        description: 'Could not connect to the backend server. Please try again later.',
        variant: 'destructive'
      });
    }
  };
    
  // Check server on component mount
  useEffect(() => {
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
    try {
      const success = await login(email, password);
      if (!success) {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred during login.",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    console.log("Attempting registration for:", email);
    try {
      const success = await register(email, password, name);
      if (!success) {
        console.error("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration.",
        variant: "destructive"
      });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          
          {/* Server Status Display */}
          <div className="mt-4 flex flex-col items-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
              ${serverStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : serverStatus === 'disconnected' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-yellow-100 text-yellow-800'}`}
            >
              <Server size={16} className={serverStatus === 'checking' ? 'animate-pulse' : ''} />
              Server: {serverStatus === 'connected' 
                ? 'Connected' 
                : serverStatus === 'disconnected' 
                  ? 'Disconnected' 
                  : 'Checking...'}
            </div>
            
            {/* Display API URL */}
            <div className="mt-2 text-xs text-gray-500">
              API URL: {apiConnection.getBaseUrl()}
            </div>
            
            {connectionDetails && connectionDetails.database && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
                  ${connectionDetails.database.status === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'}"
              >
                <Database size={16} />
                Database: {connectionDetails.database.status}
                {connectionDetails.database.name ? ` (${connectionDetails.database.name})` : ''}
              </div>
            )}
            
            <Button 
              size="sm" 
              variant={serverStatus === 'disconnected' ? "default" : "outline"}
              className="mt-3 gap-2"
              onClick={checkServer}
              disabled={isRetrying}
            >
              <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
              {isRetrying ? 'Connecting...' : 'Check Connection'}
            </Button>
          </div>
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
