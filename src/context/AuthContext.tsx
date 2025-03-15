
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import userDatabase from '@/services/userDatabase';
import { storage } from '@/utils/storage';
import { apiService } from '@/services/apiService';
import { useAuthFunctions } from '@/hooks/useAuthFunctions';

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authFunctions = useAuthFunctions(user, setUser);

  // Load user from API tokens on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        console.log("Loading user from storage...");
        
        // For native, try to get from AsyncStorage
        if (!isWeb()) {
          console.log("Native environment detected");
          const storedUser = await storage.getItem('learnit_user');
          
          if (storedUser) {
            console.log("User found in storage");
            setUser(JSON.parse(storedUser));
          } else {
            console.log("No user found in storage");
          }
        } else {
          // For web, try to get from token in sessionStorage
          console.log("Web environment detected");
          const token = sessionStorage.getItem('token');
          
          if (token) {
            console.log("Token found, attempting to get current user");
            try {
              const response = await apiService.getCurrentUser();
              if (response.data && response.data.user) {
                console.log("User retrieved from API");
                setUser(response.data.user);
              } else {
                console.log("No user data returned from API");
              }
            } catch (error) {
              console.error('Error getting current user:', error);
              console.log("No user in storage, trying token authentication");
            }
          } else {
            console.log("No token found in sessionStorage");
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Helper function to check if running in web environment
  const isWeb = () => {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  };

  // Combine auth functions with user state
  const value: AuthContextType = {
    user,
    loading,
    ...authFunctions
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
