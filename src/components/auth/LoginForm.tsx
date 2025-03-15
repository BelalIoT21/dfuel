
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PasswordResetDialog } from './PasswordResetDialog';
import { motion } from 'framer-motion';
import { apiService } from '@/services/apiService';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onToggleMode: () => void;
  serverStatus?: 'connecting' | 'connected' | 'disconnected';
}

const formAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export const LoginForm = ({ onLogin, onToggleMode, serverStatus = 'connecting' }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

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

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    
    return !emailErr && !passwordErr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted", { email, password });
    setFormError('');
    
    if (!validateForm()) return;
    
    if (serverStatus === 'disconnected') {
      setFormError('Cannot connect to server. Please ensure the backend server is running and MongoDB is connected.');
      return;
    }
    
    try {
      await onLogin(email, password);
      console.log("Login successful");
    } catch (error) {
      console.error("Authentication error:", error);
      setFormError('Authentication failed. Please try again.');
    }
  };

  return (
    <Card className="shadow-lg border-purple-100">
      <CardHeader className="pb-2">
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        {serverStatus === 'disconnected' && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Server disconnected. Check if backend is running with MongoDB connected.
            </AlertDescription>
          </Alert>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          variants={formAnimation}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-2" variants={itemAnimation}>
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
          </motion.div>
          
          <motion.div className="space-y-2" variants={itemAnimation}>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pr-10 ${passwordError ? 'border-red-500' : ''}`}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          </motion.div>
          
          <motion.div className="text-right" variants={itemAnimation}>
            <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-sm text-purple-600 hover:underline"
                >
                  Forgot your password?
                </button>
              </DialogTrigger>
              <PasswordResetDialog 
                isOpen={isForgotPasswordOpen} 
                onOpenChange={setIsForgotPasswordOpen}
              />
            </Dialog>
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={serverStatus === 'disconnected'}
            >
              Sign In
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={onToggleMode}
            className="text-sm text-purple-600 hover:underline"
            type="button"
          >
            Don't have an account? Register
          </button>
        </motion.div>
      </CardContent>
    </Card>
  );
};
