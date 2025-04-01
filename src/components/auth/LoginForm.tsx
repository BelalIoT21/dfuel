
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { motion } from 'framer-motion';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onToggleMode: () => void;
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

export const LoginForm = ({ onLogin, onToggleMode }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    try {
      setIsSubmitting(true);
      await onLogin(email, password);
      console.log("Login successful");
    } catch (error) {
      console.error("Authentication error:", error);
      setFormError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-purple-100">
      <CardHeader className="pb-1 pt-3 px-4 md:p-6">
        <CardTitle className="text-xl md:text-2xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        {formError && (
          <Alert variant="destructive" className="mb-2 py-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{formError}</AlertDescription>
          </Alert>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-2.5"
          variants={formAnimation}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-1" variants={itemAnimation}>
            <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full h-8 text-xs md:text-sm ${emailError ? 'border-red-500' : ''}`}
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </motion.div>
          
          <motion.div className="space-y-1" variants={itemAnimation}>
            <Label htmlFor="password" className="text-xs md:text-sm">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full h-8 text-xs md:text-sm ${passwordError ? 'border-red-500' : ''}`}
              />
            </div>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 h-8 text-xs md:text-sm mt-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div 
          className="mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={onToggleMode}
            className="text-[10px] md:text-xs text-purple-600 hover:underline"
            type="button"
          >
            Don't have an account? Register
          </button>
        </motion.div>
      </CardContent>
    </Card>
  );
};
