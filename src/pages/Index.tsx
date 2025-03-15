
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  console.log("Index component initializing");
  const [isLogin, setIsLogin] = useState(true);
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const { user, login, register, loading } = useAuth();
  const navigate = useNavigate();

  console.log("Index render with auth state:", { user, loading });

  // Check server connection
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log("Checking server health...");
        const response = await apiService.checkHealth();
        if (response.data) {
          console.log("Server health check:", response.data);
          setServerStatus('connected');
          toast({
            title: 'Server Connected',
            description: 'Successfully connected to the backend server',
          });
        }
      } catch (error) {
        console.error("Server connection error:", error);
        setServerStatus('disconnected');
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
    console.log("Auth state in redirect effect:", { user, loading });
    
    if (user) {
      console.log("User is logged in, redirecting to home:", user);
      navigate('/home');
    }
  }, [user, navigate, loading]);

  const handleLogin = async (email: string, password: string) => {
    console.log("Attempting login with:", email);
    try {
      const success = await login(email, password);
      if (success) {
        console.log("Login successful, should redirect soon");
      } else {
        console.log("Login failed");
        toast({
          title: "Login failed",
          description: "Invalid credentials or server error",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    console.log("Attempting registration for:", email);
    try {
      const success = await register(email, password, name);
      if (success) {
        console.log("Registration successful, should redirect soon");
      } else {
        console.log("Registration failed");
        toast({
          title: "Registration failed",
          description: "Email may already be in use or server error",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  // Add fallback content to ensure something is always visible
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-purple-800">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering Index component UI, login mode:", isLogin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 tracking-tight">Learnit</h1>
          <p className="mt-2 text-md md:text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          {serverStatus && (
            <div className={`mt-2 text-sm ${serverStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
              Server status: {serverStatus}
            </div>
          )}
        </div>

        {isLogin ? (
          <LoginForm 
            onLogin={handleLogin} 
            onToggleMode={toggleMode} 
          />
        ) : (
          <RegisterForm 
            onRegister={handleRegister} 
            onToggleMode={toggleMode} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
