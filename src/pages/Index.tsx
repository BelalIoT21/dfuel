
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';
import { getEnv } from '@/utils/env';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Check server connection
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log("Checking server health...");
        // Get current API URL for better error messages
        const currentApiUrl = getEnv('API_URL');
        console.log("Current API URL:", currentApiUrl);
        
        const response = await apiService.checkHealth();
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
            description: `Could not connect to the backend server at ${currentApiUrl}. Please ensure the server is running.`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error("Server connection error:", error);
        setServerStatus('disconnected');
        setConnectionDetails(null);
        toast({
          title: 'Server Connection Failed',
          description: 'Could not connect to the backend server. Please try again later.',
          variant: 'destructive'
        });
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

  // Debug rendering
  console.log("Rendering Index component");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          {serverStatus && (
            <div className="mt-2 flex flex-col items-center">
              <div className={`text-sm ${serverStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                Server status: {serverStatus}
              </div>
              {connectionDetails && connectionDetails.database && (
                <div className="text-xs text-gray-600 mt-1">
                  Database: {connectionDetails.database.status} 
                  {connectionDetails.database.name ? ` (${connectionDetails.database.name})` : ''}
                </div>
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
