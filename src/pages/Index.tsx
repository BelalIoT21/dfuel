
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';
import mongoDbService from '@/services/mongoDbService';

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
        
        // Try direct fetch first with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
          const response = await fetch('http://localhost:4000/api/health', {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            console.log("Server health check:", data);
            setServerStatus('connected');
            
            // Set MongoDB user count if available from health endpoint
            if (data.mongodb && typeof data.mongodb.userCount === 'number') {
              setDbUserCount(data.mongodb.userCount);
              console.log("MongoDB user count from health endpoint:", data.mongodb.userCount);
            } else {
              // If not available from health endpoint, get it from MongoDB service
              const count = await mongoDbService.getUserCount();
              setDbUserCount(count);
              console.log("MongoDB user count from service:", count);
            }
            
            toast({
              title: 'Server Connected',
              description: 'Successfully connected to the backend server',
            });
            
            return; // Exit early if successful
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error("Direct fetch error:", fetchError);
        }
        
        // If direct fetch fails, throw an error to try the API service
        throw new Error("Direct fetch failed");
        
      } catch (error) {
        console.error("Server connection error:", error);
        setServerStatus('disconnected');
        
        toast({
          title: 'Server Connection Failed',
          description: 'Using fallback data. You can still explore the app.',
          variant: 'destructive'
        });
        
        // Try API service as fallback
        try {
          // Get user count from the service (which has fallbacks built in)
          const count = await mongoDbService.getUserCount();
          setDbUserCount(count);
          console.log("MongoDB user count from service (fallback):", count);
          
          // If we got a count, we can say we're connected via fallback
          if (count > 0) {
            setServerStatus('connected via fallback');
          }
        } catch (apiError) {
          console.error("API service connection also failed:", apiError);
        }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          {serverStatus && (
            <div className={`mt-2 text-sm ${serverStatus.includes('connected') ? 'text-green-600' : 'text-red-600'}`}>
              Server status: {serverStatus}
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
