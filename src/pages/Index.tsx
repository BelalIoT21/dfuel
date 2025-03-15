
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
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Check server connection 
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log("Checking server health...");
        setIsLoading(true);
        
        // Force a connection check
        await connectionManager.checkConnection();
        setIsLoading(false);
      } catch (error) {
        console.error("Server connection error:", error);
        setIsLoading(false);
      }
    };
    
    // Run the check immediately
    checkServer();
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
    console.log("Attempting login with:", email);
    try {
      // Always try to log in - the Auth context will handle all scenarios
      await login(email, password);
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
    console.log("Attempting registration for:", email);
    try {
      await register(email, password, name);
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
