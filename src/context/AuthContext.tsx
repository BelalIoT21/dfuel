import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import userDatabase from '../services/userDatabase';
import { useToast } from '@/hooks/use-toast';

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  certifications: string[];
  lastLogin: string;
  bookings: {
    id: string;
    machineId: string;
    date: string;
    time: string;
    status: 'Pending' | 'Approved' | 'Completed' | 'Canceled';
  }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  addCertification: (machineId: string) => Promise<boolean>;
  updateProfile: (details: { name?: string; email?: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a user in localStorage on initial load
    const storedUser = localStorage.getItem('learnit_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const userData = userDatabase.authenticate(email, password);
    if (userData) {
      setUser(userData as User);
      localStorage.setItem('learnit_user', JSON.stringify(userData));
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`
      });
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials.",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const userData = userDatabase.registerUser(email, password, name);
    if (userData) {
      setUser(userData as User);
      localStorage.setItem('learnit_user', JSON.stringify(userData));
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`
      });
      return true;
    } else {
      toast({
        title: "Registration failed",
        description: "Email already in use.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('learnit_user');
    toast({
      description: "Logged out successfully."
    });
  };

  const addCertification = async (machineId: string): Promise<boolean> => {
    if (!user) return false;
    const success = userDatabase.addCertification(user.id, machineId);
    if (success) {
      // Update user context with new certification
      const updatedUser = { ...user, certifications: [...user.certifications, machineId] };
      setUser(updatedUser);
      localStorage.setItem('learnit_user', JSON.stringify(updatedUser));
      return true;
    } else {
      toast({
        title: "Error",
        description: "Failed to add certification.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProfile = async (details: { name?: string; email?: string }): Promise<boolean> => {
    if (!user) return false;
    const success = userDatabase.updateUserProfile(user.id, details);
    if (success) {
      const updatedUser = { ...user, ...details };
      setUser(updatedUser);
      localStorage.setItem('learnit_user', JSON.stringify(updatedUser));
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      return true;
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    const success = userDatabase.changePassword(user.id, currentPassword, newPassword);
    if (success) {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully."
      });
      return true;
    } else {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive"
      });
      return false;
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    const success = userDatabase.requestPasswordReset(email);
    if (success) {
      toast({
        title: "Password reset requested",
        description: "Check your email for a reset code."
      });
      return true;
    } else {
      toast({
        title: "Error",
        description: "Failed to request password reset. Email not found.",
        variant: "destructive"
      });
      return false;
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string): Promise<boolean> => {
    const success = userDatabase.resetPassword(email, resetCode, newPassword);
    if (success) {
      toast({
        title: "Password reset successful",
        description: "Your password has been reset."
      });
      return true;
    } else {
      toast({
        title: "Error",
        description: "Failed to reset password. Invalid code or email.",
        variant: "destructive"
      });
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    addCertification,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
