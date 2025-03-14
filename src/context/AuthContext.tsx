
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
      // Simulate API call
      if (email === 'admin@admin.com' && password === 'admin') {
        const adminUser = {
          id: '1',
          email: 'admin@admin.com',
          isAdmin: true,
          name: 'Admin',
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        navigate('/admin');
      } else {
        const user = {
          id: '2',
          email,
          isAdmin: false,
          name: 'User',
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/home');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      const user = {
        id: Math.random().toString(),
        email,
        isAdmin: false,
        name,
      };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/home');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
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
