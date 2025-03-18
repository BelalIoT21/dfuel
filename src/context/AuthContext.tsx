import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import userDatabase from '@/services/userDatabase';
import { storage } from '@/utils/storage';
import { apiService } from '@/services/apiService';
import { useAuthFunctions } from '@/hooks/useAuthFunctions';
import { certificationService } from '@/services/certificationService';
import { userDatabaseService } from '@/services/database/userService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { login: loginFn, register: registerFn, logout: logoutFn } = useAuthFunctions(user, setUser);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Checking authentication status...');
        const token = localStorage.getItem('token');
        
        if (token) {
          console.log('Found auth token, attempting to get current user...');
          try {
            apiService.setToken(token);
            const response = await apiService.getCurrentUser();
            
            if (response.data) {
              console.log('Successfully retrieved current user from API');
              const userData = {
                ...response.data,
                id: response.data._id || response.data.id
              };
              
              if (!userData.certifications) {
                userData.certifications = [];
              } else if (!Array.isArray(userData.certifications)) {
                userData.certifications = [String(userData.certifications)];
              }
              
              console.log('User certifications from API:', userData.certifications);
              
              if (userData.certifications.length === 0 && userData.id) {
                try {
                  console.log('Fetching certifications separately from service...');
                  const certifications = await certificationService.getUserCertifications(userData.id);
                  if (Array.isArray(certifications) && certifications.length > 0) {
                    console.log('Found certifications from service:', certifications);
                    userData.certifications = certifications;
                  }
                } catch (certErr) {
                  console.error('Error fetching certifications:', certErr);
                }
              }
              
              await storage.setItem('learnit_user', JSON.stringify(userData));
              setUser(userData);
            } else {
              console.log('Token might be invalid, removing it');
              localStorage.removeItem('token');
              apiService.setToken(null);
              
              const storedUser = await storage.getItem('learnit_user');
              if (storedUser) {
                console.log('Retrieved user data from storage');
                const parsedUser = JSON.parse(storedUser);
                
                if (!parsedUser.certifications) {
                  parsedUser.certifications = [];
                } else if (!Array.isArray(parsedUser.certifications)) {
                  parsedUser.certifications = [String(parsedUser.certifications)];
                }
                
                setUser(parsedUser);
              }
            }
          } catch (error) {
            console.error('Error getting current user with token:', error);
            setTimeout(async () => {
              try {
                const retryResponse = await apiService.getCurrentUser();
                if (retryResponse.data) {
                  console.log('Successfully retrieved user on retry');
                  const userData = {
                    ...retryResponse.data,
                    id: retryResponse.data._id || retryResponse.data.id
                  };
                  
                  if (!userData.certifications) {
                    userData.certifications = [];
                  } else if (!Array.isArray(userData.certifications)) {
                    userData.certifications = [String(userData.certifications)];
                  }
                  
                  await storage.setItem('learnit_user', JSON.stringify(userData));
                  setUser(userData);
                } else {
                  localStorage.removeItem('token');
                  apiService.setToken(null);
                  
                  const storedUser = await storage.getItem('learnit_user');
                  if (storedUser) {
                    try {
                      const parsedUser = JSON.parse(storedUser);
                      
                      if (!parsedUser.certifications) {
                        parsedUser.certifications = [];
                      } else if (!Array.isArray(parsedUser.certifications)) {
                        parsedUser.certifications = [String(parsedUser.certifications)];
                      }
                      
                      setUser(parsedUser);
                    } catch (parseError) {
                      console.error('Error parsing stored user:', parseError);
                    }
                  }
                }
              } catch (retryError) {
                console.error('Retry failed, removing token:', retryError);
                localStorage.removeItem('token');
                apiService.setToken(null);
                
                const storedUser = await storage.getItem('learnit_user');
                if (storedUser) {
                  try {
                    setUser(JSON.parse(storedUser));
                  } catch (parseError) {
                    console.error('Error parsing stored user:', parseError);
                  }
                }
              } finally {
                setLoading(false);
              }
            }, 1000);
            return;
          }
        } else {
          const storedUser = await storage.getItem('learnit_user');
          if (storedUser) {
            console.log('Retrieved user data from storage');
            try {
              const parsedUser = JSON.parse(storedUser);
              
              if (!parsedUser.certifications) {
                parsedUser.certifications = [];
              } else if (!Array.isArray(parsedUser.certifications)) {
                parsedUser.certifications = [String(parsedUser.certifications)];
              }
              
              if (parsedUser.id && parsedUser.certifications.length === 0) {
                try {
                  console.log('Fetching certifications separately for stored user...');
                  const certifications = await certificationService.getUserCertifications(parsedUser.id);
                  if (Array.isArray(certifications) && certifications.length > 0) {
                    console.log('Found certifications for stored user:', certifications);
                    parsedUser.certifications = certifications;
                    
                    await storage.setItem('learnit_user', JSON.stringify(parsedUser));
                  }
                } catch (certErr) {
                  console.error('Error fetching certifications for stored user:', certErr);
                }
              }
              
              setUser(parsedUser);
            } catch (parseError) {
              console.error('Error parsing stored user:', parseError);
            }
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

  const login = async (email: string, password: string) => {
    return await loginFn(email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    return await registerFn(email, password, name);
  };

  const logout = async () => {
    await logoutFn();
  };

  const addCertification = async (machineId: string) => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.addCertification(user.id, machineId);
      
      if (success) {
        const updatedUser = {
          ...user,
          certifications: [...user.certifications, machineId]
        };
        
        setUser(updatedUser);
        await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  };

  const updateProfile = async (updates: { name?: string, email?: string }) => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.updateUserProfile(user.id, updates);
      
      if (success) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return false;
    
    try {
      console.log("Attempting to change password in AuthContext...");
      
      try {
        console.log("Attempting to change password via API...");
        const response = await apiService.changePassword(currentPassword, newPassword);
        if (response.data && !response.error) {
          console.log("Successfully changed password via API");
          return true;
        }
      } catch (apiError) {
        console.error("API error when changing password:", apiError);
      }
      
      console.log("Falling back to userDatabase.changePassword...");
      const success = await userDatabase.changePassword(user.id, currentPassword, newPassword);
      
      if (success) {
        console.log("Password changed successfully with userDatabase");
        return true;
      }
      
      throw new Error('Current password is incorrect or service unavailable');
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      return await userDatabase.requestPasswordReset(email);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return false;
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    try {
      return await userDatabase.resetPassword(email, resetCode, newPassword);
    } catch (error) {
      console.error('Error resetting password:', error);
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
      {children}
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
