
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials
const ADMIN_EMAIL = "admin@machinemaster.com";
const ADMIN_PASSWORD = "admin123";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simulated authentication - Replace with real auth later
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check for admin login
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser = {
          id: '1',
          email: ADMIN_EMAIL,
          isAdmin: true,
          name: 'Administrator',
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        navigate('/admin');
        toast({
          title: "Welcome Administrator",
          description: "You have successfully logged in as an administrator."
        });
      } else if (email && password && password.length >= 6) {
        // Basic validation for regular users
        const user = {
          id: Math.random().toString(),
          email,
          isAdmin: false,
          name: email.split('@')[0],
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/home');
        toast({
          title: "Login Successful",
          description: "Welcome back to Machine Master!"
        });
      } else {
        // Login failed
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Basic validation
      if (!email || !password || password.length < 6 || !name) {
        toast({
          title: "Registration Failed",
          description: "Please provide a valid email, name, and password (min 6 characters).",
          variant: "destructive"
        });
        return;
      }

      // Check if trying to register as admin
      if (email === ADMIN_EMAIL) {
        toast({
          title: "Registration Failed",
          description: "This email is already in use. Please use a different email.",
          variant: "destructive"
        });
        return;
      }

      // Simulating successful registration
      const user = {
        id: Math.random().toString(),
        email,
        isAdmin: false,
        name,
      };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/home');
      toast({
        title: "Registration Successful",
        description: "Welcome to Machine Master!"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
