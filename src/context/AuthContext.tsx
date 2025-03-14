
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import userDatabase from '../services/userDatabase';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  name: string;
  certifications: string[];
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  addCertification: (machineId: string) => void;
  updateProfile: (updates: {name?: string, email?: string}) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Input validation
      if (!email || !password) {
        toast({
          title: "Login Failed",
          description: "Please provide both email and password.",
          variant: "destructive"
        });
        return;
      }

      // Authenticate with user database
      const authenticatedUser = userDatabase.authenticate(email, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
        
        if (authenticatedUser.isAdmin) {
          navigate('/admin');
          toast({
            title: `Welcome ${authenticatedUser.name}`,
            description: "You have successfully logged in as an administrator."
          });
        } else {
          navigate('/home');
          toast({
            title: `Welcome ${authenticatedUser.name}`,
            description: "You have successfully logged in to Machine Master!"
          });
        }
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
      // Input validation
      if (!email || !password || !name) {
        toast({
          title: "Registration Failed",
          description: "Please provide a valid email, name, and password.",
          variant: "destructive"
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Registration Failed",
          description: "Password must be at least 6 characters long.",
          variant: "destructive"
        });
        return;
      }

      // Check for admin email
      if (email.toLowerCase() === 'admin@machinemaster.com') {
        toast({
          title: "Registration Failed",
          description: "This email is reserved. Please use a different email.",
          variant: "destructive"
        });
        return;
      }

      // Register with user database
      const newUser = userDatabase.registerUser(email, password, name);
      
      if (newUser) {
        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        navigate('/home');
        toast({
          title: `Welcome ${newUser.name}`,
          description: "Your account has been created successfully!"
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "This email is already in use. Please use a different email or login.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
  };

  const addCertification = (machineId: string) => {
    if (!user) return;
    
    const success = userDatabase.addCertification(user.id, machineId);
    
    if (success) {
      // Update the local user state with the new certification
      const updatedUser = {
        ...user,
        certifications: [...user.certifications, machineId]
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      toast({
        title: "Certification Added",
        description: "You are now certified to use this machine."
      });
    }
  };

  const updateProfile = (updates: {name?: string, email?: string}) => {
    if (!user) return;
    
    const success = userDatabase.updateUserProfile(user.id, updates);
    
    if (success) {
      // Update the local user state with the changes
      const updatedUser = {
        ...user,
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email })
      };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading,
      addCertification,
      updateProfile
    }}>
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
