
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { checkServerHealth } from '@/utils/serverConnection';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Check server connection
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log("Checking server health...");
        
        const healthStatus = await checkServerHealth();
        console.log("Server health check result:", healthStatus);
        
        if (healthStatus.serverRunning) {
          setServerStatus('connected');
          console.log("Server is running and database is assumed connected");
          
          // Only show error toast if there's a real database issue and we need user action
          // and we're sure the database is actually disconnected
          if (!healthStatus.databaseConnected && 
              healthStatus.message.includes('database connection failed')) {
            toast({
              title: 'Database Connection Issue',
              description: 'The server is running but there might be database connection issues.',
              variant: 'destructive'
            });
          }
        } else {
          // Only change to disconnected if server is actually not running
          setServerStatus('disconnected');
          console.error("Basic server connection failed");
          
          // Only show the toast notification, no longer displaying message in the UI
          toast({
            title: 'Server Connection Failed',
            description: 'Could not connect to the backend server. Please ensure the server is running on port 4000.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error("Server connection error:", error);
        setServerStatus('disconnected');
      }
    };
    
    checkServer();
    
    // Set up interval to periodically check server connection
    const intervalId = setInterval(checkServer, 15000); // Check every 15 seconds
    
    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("User is already logged in, redirecting to home:", user);
      // Use setTimeout to ensure this runs after component mount
      setTimeout(() => {
        navigate('/home');
      }, 0);
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    console.log("Attempting login with:", email);
    try {
      await login(email, password);
      // Navigation will happen automatically in the useEffect
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    console.log("Attempting registration for:", email);
    try {
      await register(email, password, name);
      // Navigation will happen automatically in the useEffect
    } catch (error) {
      console.error("Registration failed:", error);
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
                serverStatus={serverStatus}
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
