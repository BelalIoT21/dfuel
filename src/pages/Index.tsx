
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { connectionManager } from '@/services/api/connectionManager';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Check server connection and set offline mode right away
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log("Checking server health...");
        setIsLoading(true);
        
        // Force a connection check
        const isConnected = await connectionManager.checkConnection();
        
        // Set offline mode if not connected
        if (!isConnected) {
          console.log("Server not connected, enabling offline mode");
          setOfflineMode(true);
          toast({
            title: 'Offline Mode Enabled',
            description: 'Using local authentication. Some features may be limited.',
            variant: 'default'
          });
        } else {
          console.log("Server connected successfully");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Server connection error:", error);
        setOfflineMode(true);
        toast({
          title: 'Offline Mode Enabled',
          description: 'Using local authentication. Some features may be limited.',
          variant: 'default'
        });
        setIsLoading(false);
      }
    };
    
    // Run the check immediately
    checkServer();
    
    // Also mark as offline if there's no server response within 3 seconds
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Server connection timeout, enabling offline mode");
        setOfflineMode(true);
        setIsLoading(false);
        toast({
          title: 'Offline Mode Enabled',
          description: 'Server connection timed out. Using local authentication.',
          variant: 'default'
        });
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("User is logged in, redirecting:", user);
      // Redirect admin users to admin dashboard
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    console.log("Attempting login with:", email, "in", offlineMode ? "offline" : "online", "mode");
    try {
      if (offlineMode && email === "admin@learnit.com" && password === "admin123") {
        console.log("Special handling for admin in offline mode");
        // Special handling for admin in offline mode
        await login(email, password, true);
        return;
      }
      
      // Always pass the offline mode flag so the auth context knows
      await login(email, password, offlineMode);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    console.log("Attempting registration for:", email, "in", offlineMode ? "offline" : "online", "mode");
    try {
      await register(email, password, name, offlineMode);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Could not create account',
        variant: 'destructive'
      });
      throw error; // Rethrow so the form can handle it
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
          {offlineMode && (
            <div className="mt-2 p-2 bg-amber-50 text-amber-800 rounded-md text-sm">
              <span className="font-medium">Offline Mode Active</span> - Using local authentication
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
                isOfflineMode={offlineMode}
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
                isOfflineMode={offlineMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
