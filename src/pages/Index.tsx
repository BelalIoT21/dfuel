
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';

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
        
        // Try the simple / endpoint first (no DB check)
        try {
          const response = await fetch('http://localhost:4000/');
          if (response.ok) {
            console.log("Basic server connection OK");
            
            // Then check the DB connection via the health endpoint
            try {
              const healthResponse = await apiService.checkHealth();
              console.log("Health check response:", healthResponse);
              
              if (healthResponse.data && healthResponse.data.database && healthResponse.data.database.connected) {
                setServerStatus('connected');
                console.log("Server fully connected with database");
              } else {
                setServerStatus('disconnected');
                toast({
                  title: 'Database Connection Issue',
                  description: 'Backend server is running but the database connection is not established.',
                  variant: 'destructive'
                });
              }
            } catch (healthError) {
              console.error("Health check failed:", healthError);
              setServerStatus('disconnected');
              toast({
                title: 'Health Check Failed',
                description: 'Could not verify database connection. Please check server logs.',
                variant: 'destructive'
              });
            }
          } else {
            throw new Error('Server not responding');
          }
        } catch (error) {
          console.error("Basic server connection failed:", error);
          setServerStatus('disconnected');
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
    const intervalId = setInterval(checkServer, 10000); // Check every 10 seconds
    
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

  // Debug rendering
  console.log("Rendering Index component, user:", user ? "logged in" : "not logged in");
  console.log("Current server status:", serverStatus);

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
