
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(user.isAdmin ? '/admin' : '/home');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateName = (name: string) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    let nameErr = '';
    
    if (!isLogin) {
      nameErr = validateName(name);
    }
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setNameError(nameErr);
    
    return !emailErr && !passwordErr && (isLogin || !nameErr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) return;
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error) {
      setFormError('Authentication failed. Please try again.');
    }
  };

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setFormError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearErrors();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Machine Master</h1>
          <p className="mt-2 text-lg text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isLogin ? 'Sign In' : 'Register'}</CardTitle>
            <CardDescription>
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Fill in your details to create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full ${nameError ? 'border-red-500' : ''}`}
                  />
                  {nameError && <p className="text-sm text-red-500">{nameError}</p>}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${emailError ? 'border-red-500' : ''}`}
                />
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${passwordError ? 'border-red-500' : ''}`}
                />
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              </div>
              
              <Button type="submit" className="w-full">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={toggleMode}
                className="text-sm text-primary hover:underline"
                type="button"
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : 'Already have an account? Sign In'}
              </button>
            </div>
            
            {isLogin && (
              <div className="mt-6 border-t pt-4">
                <p className="text-xs text-center text-gray-500 mb-2">Admin demo credentials:</p>
                <div className="text-xs text-center text-gray-600">Email: admin@machinemaster.com</div>
                <div className="text-xs text-center text-gray-600">Password: admin123</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
