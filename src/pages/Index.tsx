import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

const pageLogger = logger.child('IndexPage');

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkServer = async () => {
      try {
        pageLogger.info("Checking server health...");
        const response = await apiService.checkHealth();
        if (response.data) {
          pageLogger.info("Server health check successful:", response.data);
          setServerStatus('connected');
          toast({
            title: 'Server Connected',
            description: 'Successfully connected to the backend server',
          });
        } else {
          pageLogger.warn("Server health check failed");
          setServerStatus('disconnected');
          toast({
            title: 'Server Connection Failed',
            description: 'Could not connect to the backend server. Please ensure the server is running at http://localhost:4000.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        pageLogger.error("Server connection error:", error);
        setServerStatus('disconnected');
        toast({
          title: 'Server Connection Failed',
          description: 'Could not connect to the backend server. Please ensure the server is running at http://localhost:4000.',
          variant: 'destructive'
        });
      }
    };
    
    checkServer();
  }, []);

  useEffect(() => {
    if (user) {
      pageLogger.info("User is logged in, redirecting:", user);
      navigate('/home');
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    pageLogger.info("Attempting login with:", { email });
    const success = await login(email, password);
    if (success) {
      pageLogger.info("Login successful, navigating to home");
      navigate('/home');
    } else {
      pageLogger.warn("Login failed for:", { email });
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    pageLogger.info("Attempting registration for:", { email });
    const success = await register(email, password, name);
    if (success) {
      pageLogger.info("Registration successful, navigating to home");
      navigate('/home');
    } else {
      pageLogger.warn("Registration failed for:", { email });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    pageLogger.debug(`Switched to ${isLogin ? 'register' : 'login'} mode`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          {serverStatus && (
            <div className={`mt-2 text-sm ${serverStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
              {serverStatus === 'connected' 
                ? 'Connected to server' 
                : 'Server connection failed. Please ensure the server is running at http://localhost:4000.'}
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
