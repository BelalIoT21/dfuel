
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AnimatePresence, motion } from 'framer-motion';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';
import ConnectionStatus from '@/components/api/ConnectionStatus';
import { apiConnection } from '@/services/api/apiConnection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setEnv, getEnv } from '@/utils/env';
import { Badge } from '@/components/ui/badge';
import { Server } from 'lucide-react';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const currentApiUrl = getEnv('API_URL');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("User is logged in, redirecting:", user);
      navigate('/home');
    }
  }, [user, navigate]);

  // Load the current API URL
  useEffect(() => {
    setCustomApiUrl(currentApiUrl);
    
    // Initialize connection with current API URL
    apiConnection.setBaseUrl(currentApiUrl);
    
    // Check connection on component mount
    checkServer();
  }, []);

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

  const checkServer = async () => {
    try {
      console.log("Checking server health...");
      const connected = await apiConnection.checkConnection(true);
      
      if (!connected) {
        console.error("API connection failed");
      }
    } catch (error) {
      console.error("Error checking server:", error);
    }
  };

  const updateApiUrl = () => {
    if (customApiUrl && customApiUrl.startsWith('http')) {
      setEnv('API_URL', customApiUrl);
      apiConnection.setBaseUrl(customApiUrl);
      toast({
        title: "API URL Updated",
        description: `API URL set to: ${customApiUrl}. Checking connection...`,
      });
      
      // Check connection with new URL
      setTimeout(() => {
        apiConnection.checkConnection(true)
          .then(connected => {
            if (connected) {
              toast({
                title: "Connection Successful",
                description: "Successfully connected to the API server.",
              });
            } else {
              toast({
                title: "Connection Failed",
                description: "Could not connect to the API server. Please check the URL.",
                variant: "destructive"
              });
            }
          });
      }, 500);
    } else {
      toast({
        title: "Invalid URL",
        description: "API URL must start with http:// or https://",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          
          {/* API URL Banner */}
          <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Server size={16} className="text-blue-500" />
              <span className="font-medium">Using API:</span>
            </div>
            <Badge variant="outline" className="bg-white px-3 py-1 font-mono text-xs">
              {currentApiUrl}
            </Badge>
            <p className="mt-2 text-xs text-gray-500">
              Running locally? Make sure your server is started with <code>npm run server</code>
            </p>
          </div>
          
          {/* Server Status Display */}
          <div className="mt-4">
            <ConnectionStatus />
          </div>
          
          {/* API URL Configuration */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowApiConfig(!showApiConfig)}
            >
              {showApiConfig ? 'Hide API Config' : 'Configure API URL'}
            </Button>
            
            {showApiConfig && (
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500 mb-2">
                  You can configure a custom API URL below:
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="http://localhost:4000/api"
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    className="text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={updateApiUrl}
                  >
                    Update
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost" 
                  className="mt-2 text-xs"
                  onClick={() => {
                    setCustomApiUrl('http://localhost:4000/api');
                    setEnv('API_URL', 'http://localhost:4000/api');
                    apiConnection.setBaseUrl('http://localhost:4000/api');
                    checkServer();
                    toast({
                      title: "Default API URL Restored",
                      description: "Using http://localhost:4000/api"
                    });
                  }}
                >
                  Reset to Default
                </Button>
              </div>
            )}
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
